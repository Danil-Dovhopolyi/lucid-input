'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FormulaInput } from '@/components/FormulaInput'

const queryClient = new QueryClient()

const Home: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <div className="app-container">
                <main>
                    <FormulaInput />
                </main>
            </div>
        </QueryClientProvider>
    )
}

export default Home
