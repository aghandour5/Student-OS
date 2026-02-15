import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmDialog, ConfirmVariant } from '@/components/ui/ConfirmDialog';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmVariant;
}

interface ConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    alert: (title: string, message: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<{
        visible: boolean;
        options: ConfirmOptions;
        resolve: (value: boolean) => void;
    }>({
        visible: false,
        options: { title: '', message: '' },
        resolve: () => { },
    });

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setState({
                visible: true,
                options,
                resolve,
            });
        });
    }, []);

    const alert = useCallback((title: string, message: string) => {
        return new Promise<void>((resolve) => {
            setState({
                visible: true,
                options: {
                    title,
                    message,
                    confirmText: 'OK',
                    cancelText: '', // Hide cancel button
                    variant: 'info',
                },
                resolve: (result) => resolve(),
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve(true);
        setState((prev) => ({ ...prev, visible: false }));
    }, [state]);

    const handleCancel = useCallback(() => {
        state.resolve(false);
        setState((prev) => ({ ...prev, visible: false }));
    }, [state]);

    // If cancelText is explicit empty string, we hide the cancel button by modifying the dialog logic?
    // Or purely via conditional rendering in Dialog?
    // My Dialog implementation renders cancel button if text is provided.
    // Wait, my Dialog implementation provided default "Cancel".
    // I should update Dialog to accept optional onCancel, or hide it.

    // Let's check ConfirmDialog.tsx again.
    // It renders: 
    // <Pressable onPress={onCancel} ... ><Text>{cancelText}</Text></Pressable>
    // If cancelText is empty locally, it might still show empty button.
    // I'll update ConfirmDialog to hide cancel button if cancelText is empty.

    return (
        <ConfirmContext.Provider value={{ confirm, alert }}>
            {children}
            <ConfirmDialog
                visible={state.visible}
                title={state.options.title}
                message={state.options.message}
                confirmText={state.options.confirmText}
                cancelText={state.options.cancelText}
                variant={state.options.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context;
}
