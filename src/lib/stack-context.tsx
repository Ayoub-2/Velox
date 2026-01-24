'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type TechStack = 'All' | 'Frontend' | 'Backend' | 'DevOps' | 'Mobile';

interface StackContextType {
    selectedStack: TechStack;
    setStack: (stack: TechStack) => void;
}

const StackContext = createContext<StackContextType | undefined>(undefined);

export function StackProvider({ children }: { children: React.ReactNode }) {
    const [selectedStack, setSelectedStack] = useState<TechStack>('All');

    useEffect(() => {
        const saved = localStorage.getItem('velox_stack_preference') as TechStack;
        if (saved && ['All', 'Frontend', 'Backend', 'DevOps', 'Mobile'].includes(saved)) {
            setSelectedStack(saved);
        }
    }, []);

    const setStack = (stack: TechStack) => {
        setSelectedStack(stack);
        localStorage.setItem('velox_stack_preference', stack);
    };

    return (
        <StackContext.Provider value={{ selectedStack, setStack }}>
            {children}
        </StackContext.Provider>
    );
}

export function useStack() {
    const context = useContext(StackContext);
    if (context === undefined) {
        throw new Error('useStack must be used within a StackProvider');
    }
    return context;
}
