// XRAuthDialog stub - placeholder for future XR dialog implementation
// This prevents build errors when dynamically importing XR dialog components

export interface XRAuthDialogProps {
    authData: {
        type: string;
        prompt?: string;
        domain?: string;
        [key: string]: any;
    };
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

// Fallback function for when XR dialog is not available  
export const XRAuthDialogFallback = ({ authData, onSubmit, onCancel }: XRAuthDialogProps) => {
    console.log('XRAuthDialogFallback: XR dialog requested but not implemented yet');
    // This is just a stub - the actual implementation would be in the calling code
    return null;
};

// Future: Full XR dialog component would go here when React Three Fiber is available
// export const XRAuthDialog = ({ authData, onSubmit, onCancel }: XRAuthDialogProps) => {
//     // Full React Three Fiber XR implementation  
//     return <XRDialogComponent ... />;
// };

export default XRAuthDialogFallback;