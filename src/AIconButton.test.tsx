import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
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
});
