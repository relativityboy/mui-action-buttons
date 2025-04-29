import React from "react";
import Button, {ButtonProps} from "@mui/material/Button";
import CameraIcon from '@mui/icons-material/Camera';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';


export interface AIconButtonProps extends ButtonProps {
    onClick: () => Promise<void>;
}

export const AIconButton: React.FC<AIconButtonProps> = ({children, className='', onClick, ...extraProps}) => {
    const [spinning, setSpinning] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);

    async function handleClick () {
        if(error) {
            setError(false)
            return
        }
        if(spinning) {
            return;
        }
        setSpinning(true);
        try {
            await onClick()
            setSpinning(false);
            setSuccess(true);
        } catch (e) {
            console.error(e);
            setSpinning(false);
            setError(true);
        }
        await new Promise(r => setTimeout(r, 2000))
        setSuccess(false);
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
    }

    return (
        <Button variant='contained' {...buttonProps}
                onClick={handleClick}
                style={{verticalAlign: 'bottom', display:'inline-block'}}
        >
            {children}
        </Button>
    )
};

export default AIconButton;
