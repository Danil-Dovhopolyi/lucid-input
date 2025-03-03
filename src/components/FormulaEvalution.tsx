import { FormulaItem } from '@/store/formulaStore'

const getValueForTag = (tagName: string): number => {
    const tagData = [
        { name: 'name 1', value: 9 },
        { name: 'name 2', value: 16 },
        { name: 'name 3', value: 95 },
        { name: 'name 4', value: 3 },
        { name: 'name 5', value: 51 },
    ]

    const found = tagData.find((item) => item.name === tagName)
    if (found) {
        return Number(found.value)
    }

    return 0
}

const formulaToExpression = (formula: FormulaItem[]): string => {
    return formula
        .map((item) => {
            if (item.type === 'tag') {
                return getValueForTag(item.value).toString()
            } else if (item.type === 'number') {
                return item.value
            }
            return item.value
        })
        .join('')
}

export const evaluateFormula = (formula: FormulaItem[]): number => {
    try {
        if (formula.length === 0) {
            return 0
        }

        const expression = formulaToExpression(formula)

        if (!expression || expression.trim() === '') {
            return 0
        }

        const sanitizedExpression = expression.trim()

        const openParenCount = (sanitizedExpression.match(/\(/g) || []).length
        const closeParenCount = (sanitizedExpression.match(/\)/g) || []).length

        if (openParenCount !== closeParenCount) {
            console.warn('Unbalanced parentheses in formula')
            return NaN
        }

        if (/[+\-*/^]{2,}/.test(sanitizedExpression)) {
            console.warn('Invalid operator sequence in formula')
            return NaN
        }

        if (
            /[+*/^]$/.test(sanitizedExpression) ||
            /^[+*/^]/.test(sanitizedExpression)
        ) {
            console.warn('Formula starts or ends with an invalid operator')
            return NaN
        }

        const result = new Function(`return (${sanitizedExpression})`)()

        if (typeof result === 'number' && !isNaN(result)) {
            return result
        }

        throw new Error('Invalid result')
    } catch (error) {
        console.error('Error evaluating formula:', error)
        return NaN
    }
}

export const validateFormula = (formula: FormulaItem[]): boolean => {
    if (formula.length === 0) return true

    try {
        const expression = formulaToExpression(formula)
        const sanitizedExpression = expression.trim()

        if (!sanitizedExpression) return true

        const openParenCount = (sanitizedExpression.match(/\(/g) || []).length
        const closeParenCount = (sanitizedExpression.match(/\)/g) || []).length
        if (openParenCount !== closeParenCount) return false

        const validOperatorPattern = /[+\-*/^]{2,}/
        if (validOperatorPattern.test(sanitizedExpression.replace(/\(-/g, '(')))
            return false

        if (/[+*/^]$/.test(sanitizedExpression)) return false

        if (/^[+*/^]/.test(sanitizedExpression)) return false

        Function(`"use strict"; void(${sanitizedExpression})`)

        return true
    } catch {
        return false
    }
}
