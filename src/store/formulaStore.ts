import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FormulaItem = {
    type: 'tag' | 'number' | 'operator'
    value: string
    id?: string
}

interface FormulaState {
    formula: FormulaItem[]
    cursorIndex: number
    result: number | null

    setFormula: (formula: FormulaItem[]) => void
    addElement: (element: FormulaItem) => void
    addElementAtIndex: (element: FormulaItem, index: number) => void
    removeLast: () => void
    removeAtIndex: (index: number) => void
    updateElement: (index: number, value: string) => void
    setCursorIndex: (index: number) => void
    setResult: (result: number | null) => void
    clear: () => void
}

export const useFormulaStore = create<FormulaState>()(
    persist(
        (set) => ({
            formula: [],
            cursorIndex: 0,
            result: null,

            setFormula: (formula) => set({ formula }),

            addElement: (element) =>
                set((state) => ({
                    formula: [...state.formula, element],
                    cursorIndex: state.formula.length + 1,
                })),

            addElementAtIndex: (element, index) =>
                set((state) => {
                    const newFormula = [...state.formula]
                    newFormula.splice(index, 0, element)
                    return {
                        formula: newFormula,
                        cursorIndex: index + 1,
                    }
                }),

            removeLast: () =>
                set((state) => ({
                    formula: state.formula.slice(0, -1),
                    cursorIndex: Math.max(0, state.formula.length - 1),
                })),

            removeAtIndex: (index) =>
                set((state) => {
                    const newFormula = [...state.formula]
                    newFormula.splice(index, 1)
                    return {
                        formula: newFormula,
                        cursorIndex: index,
                    }
                }),

            updateElement: (index, value) =>
                set((state) => {
                    const newFormula = [...state.formula]
                    newFormula[index] = { ...newFormula[index], value }
                    return { formula: newFormula }
                }),

            setCursorIndex: (index) => set({ cursorIndex: index }),

            setResult: (result) => set({ result }),

            clear: () => set({ formula: [], cursorIndex: 0, result: null }),
        }),
        {
            name: 'formula-storage',
        }
    )
)
