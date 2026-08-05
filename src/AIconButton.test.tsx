import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import AIconButton from './AIconButton';
import '@testing-library/jest-dom';

jest.useFakeTimers();

describe('AIconButton', () => {
    it('renders correctly with children', () => {
        const { getByText } = render(
            <AIconButton onClick={async () => {}}>Click Me</AIconButton>
        );
        expect(getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClickMock = jest.fn().mockResolvedValue(undefined);
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );
        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(onClickMock).toHaveBeenCalled();
        });
    });

    it('shows success state after successful click', async () => {
        const onClickMock = jest.fn().mockResolvedValue(undefined);
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('success');
        });
    });

    it('shows error state after failed click', async () => {
        const onClickMock = jest.fn().mockRejectedValue(new Error('Test Error'));
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('error');
        });
    });

    it('does not trigger multiple clicks when spinning', async () => {
        const onClickMock = jest.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        });
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);
        fireEvent.click(button);

        await waitFor(() => {
            expect(onClickMock).toHaveBeenCalledTimes(1);
        });
    });

    it('does not let a dismissed error cut a later success flash short', async () => {
        const onClickMock = jest.fn()
            .mockRejectedValueOnce(new Error('Test Error'))
            .mockResolvedValue(undefined);
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('error');
        });

        // let time pass before the error is dismissed
        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        fireEvent.click(button); // dismisses the error without re-firing onClick
        expect(onClickMock).toHaveBeenCalledTimes(1);

        fireEvent.click(button); // runs again and succeeds
        await waitFor(() => {
            expect(button.className).toContain('success');
        });
        expect(onClickMock).toHaveBeenCalledTimes(2);

        // the buggy error-path timer (scheduled ~2000ms after the failure)
        // would fire inside this window and clear the flash early
        await act(async () => {
            jest.advanceTimersByTime(1500);
        });
        expect(button.className).toContain('success');

        // the flash clears a full 2000ms after the success, not before
        await act(async () => {
            jest.advanceTimersByTime(600);
        });
        expect(button.className).not.toContain('success');
    });

    it('does not write state after unmounting during the success flash', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const onClickMock = jest.fn().mockResolvedValue(undefined);
        const { getByRole, unmount } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('success');
        });

        unmount();
        await act(async () => {
            jest.advanceTimersByTime(2100);
        });

        // no React warnings / errors from a state write on an unmounted component
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    it('does not keep running after unmounting mid-request', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        let rejectClick: (e: Error) => void = () => {};
        const onClickMock = jest.fn(
            () => new Promise<void>((_resolve, reject) => { rejectClick = reject; })
        );
        const { getByRole, unmount } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        fireEvent.click(getByRole('button'));
        unmount();

        const timerCountBeforeRejection = jest.getTimerCount();
        rejectClick(new Error('Test Error'));
        // flush the rejection through handleClick's continuation (microtasks only —
        // an async act() is avoided here because it schedules a timer of its own)
        for (let i = 0; i < 5; i++) {
            await Promise.resolve();
        }

        // the old code fell through to the success-flash sleep after an error,
        // scheduling a timer (and a later state write) on the unmounted component
        expect(jest.getTimerCount()).toBe(timerCountBeforeRejection);
        consoleErrorSpy.mockRestore();
    });

    it('exposes the error message via title and aria-label while in error state', async () => {
        const onClickMock = jest.fn().mockRejectedValue(new Error('Test Error'));
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(button.className).toContain('error');
        });
        expect(button).toHaveAttribute('title', 'Test Error');
        expect(button).toHaveAttribute('aria-label', 'Click Me: Test Error');

        fireEvent.click(button); // dismisses the error
        expect(button.className).not.toContain('error');
        expect(button).not.toHaveAttribute('title');
        expect(button).not.toHaveAttribute('aria-label');
    });

    it('marks the button aria-busy while spinning but keeps it enabled', async () => {
        let resolveClick: () => void = () => {};
        const onClickMock = jest.fn(
            () => new Promise<void>((resolve) => { resolveClick = resolve; })
        );
        const { getByRole } = render(
            <AIconButton onClick={onClickMock}>Click Me</AIconButton>
        );

        const button = getByRole('button');
        expect(button).not.toHaveAttribute('aria-busy');

        fireEvent.click(button);
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).not.toBeDisabled();

        await act(async () => {
            resolveClick();
        });
        expect(button).not.toHaveAttribute('aria-busy');
    });
});
