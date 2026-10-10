"use client";

import React from "react";
import { Button, type ButtonProps } from "@mui/material";
import CameraIcon from '@mui/icons-material/Camera';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';


export interface AIconButtonProps extends ButtonProps {
    /**
     * Async action, called without a mouse event. Await the real work; resolve
     * for a two-second success indication or reject to show a dismissible error.
     * The first click after an error dismisses it; the next click retries.
     */
    onClick: () => Promise<void>;
}

/**
 * MUI Button with async feedback. Import the package's styles.css once and use
 * sx for styling. See docs/agents.md for examples and the integration contract.
 */
export const AIconButton: React.FC<AIconButtonProps> = ({children, className='', onClick, ...extraProps}) => {
    const [spinning, setSpinning] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    // NOTE(claude): handleClick keeps running across awaits after an unmount
    // (e.g. the user navigates away mid-request or mid-flash), so every state
    // write that follows an await checks this ref first.
    const mountedRef = React.useRef(true);
    const successTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    React.useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if(successTimerRef.current !== null) {
                clearTimeout(successTimerRef.current);
                successTimerRef.current = null;
            }
        };
    }, []);

    async function handleClick () {
        if(error) {
            setError(false)
            setErrorMessage('')
            return
        }
        if(spinning) {
            return;
        }
        if(successTimerRef.current !== null) {
            clearTimeout(successTimerRef.current);
            successTimerRef.current = null;
        }
        setSuccess(false);
        setSpinning(true);
        try {
            await onClick()
        } catch (e) {
            console.error(e);
            if(mountedRef.current) {
                setSpinning(false);
                setError(true);
                setErrorMessage(e instanceof Error ? e.message : String(e));
            }
            return;
        }
        if(!mountedRef.current) {
            return;
        }
        setSpinning(false);
        setSuccess(true);
        successTimerRef.current = setTimeout(() => {
            successTimerRef.current = null;
            if(mountedRef.current) {
                setSuccess(false);
            }
        }, 2000);
    }

    const classNames = ['actn-button', className]
    if (success) {
        classNames.push('success');
    }
    if (spinning) {
        classNames.push('spin-icon');
    }
    if (error) {
        classNames.push('error');
    }

    const buttonProps = {...extraProps, className: classNames.join(' ')};
    if(spinning) {
        buttonProps['aria-busy'] = true;
        if(buttonProps.endIcon) {
            buttonProps.endIcon = <CameraIcon/>;
        }
        if(buttonProps.startIcon) {
            buttonProps.startIcon = <CameraIcon/>;
        }
    }
    if(error) {
        if(buttonProps.endIcon) {
            buttonProps.endIcon = <WarningAmberIcon/>;
        }
        if(buttonProps.startIcon) {
            buttonProps.startIcon = <WarningAmberIcon/>;
        }
        if(errorMessage) {
            buttonProps.title = errorMessage;
            const baseLabel = buttonProps['aria-label'] ?? (typeof children === 'string' ? children : undefined);
            buttonProps['aria-label'] = baseLabel ? `${baseLabel}: ${errorMessage}` : errorMessage;
        }
    }

    return (
        <Button variant='contained' {...buttonProps}
                onClick={handleClick}
                style={{verticalAlign: 'bottom'}}
        >
            {children}
        </Button>
    )
};

export default AIconButton;
