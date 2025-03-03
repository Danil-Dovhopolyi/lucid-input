'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { FormulaTag } from './FormulaTag'
import { useFormulaStore } from '@/store/formulaStore'
import { evaluateFormula, validateFormula } from '@/components/FormulaEvalution'

const OPERATORS = ['+', '-', '*', '/', '^', '(', ')']

export const FormulaInput: React.FC = () => {
    const { formula, addElement, removeLast, updateElement } = useFormulaStore()
    const [inputValue, setInputValue] = useState('')
    const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [result, setResult] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
        useState<number>(-1)

    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const suggestionRefs = useRef<(HTMLDivElement | null)[]>([])

    const { data: suggestions = [], isLoading } = useAutocomplete(inputValue)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    useEffect(() => {
        if (activeTagIndex === null && inputRef.current) {
            inputRef.current.focus()
        }
    }, [activeTagIndex])

    useEffect(() => {
        setSelectedSuggestionIndex(-1)
        suggestionRefs.current = suggestions.map(() => null)
    }, [suggestions])

    useEffect(() => {
        try {
            if (formula.length > 0) {
                if (!validateFormula(formula)) {
                    setError('Invalid formula structure')
                    setResult(null)
                    return
                }

                const calculatedResult = evaluateFormula(formula)

                if (isNaN(calculatedResult)) {
                    setError('Invalid calculation result')
                    setResult(null)
                } else {
                    setError(null)
                    setResult(calculatedResult)
                }
            } else {
                setError(null)
                setResult(null)
            }
        } catch (error) {
            console.error('Error calculating formula:', error)
            setError('Error calculating formula')
            setResult(null)
        }
    }, [formula])
    const handleTagBlur = (index: number) => {
        if (formula[index].value === '') {
            removeLast()
        } else {
            setActiveTagIndex(null)
        }
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setInputValue(value)

        if (value === '') {
            if (activeTagIndex !== null) {
                removeLast()
            }
        } else {
            setShowSuggestions(true)
        }
    }

    const validateInput = (
        value: string,
        type: 'number' | 'operator' | 'tag'
    ): boolean => {
        if (formula.length === 0) {
            if (type === 'operator' && value !== '-') {
                setError('Formula cannot start with this operator')
                return false
            }
        } else {
            const lastElement = formula[formula.length - 1]

            if (type === 'number' && lastElement.type === 'number') {
                setError('Cannot add consecutive numbers without an operator')
                return false
            }

            if (type === 'tag' && lastElement.type === 'tag') {
                setError('Cannot add consecutive tags without an operator')
                return false
            }

            if (type === 'tag' && lastElement.type === 'number') {
                setError('Cannot add a tag after a number without an operator')
                return false
            }

            if (type === 'number' && lastElement.type === 'tag') {
                setError('Cannot add a number after a tag without an operator')
                return false
            }

            if (type === 'operator' && lastElement.type === 'operator') {
                if (!(lastElement.value === '(' && value === '-')) {
                    setError('Cannot add consecutive operators')
                    return false
                }
            }

            if (
                type === 'operator' &&
                lastElement.type === 'operator' &&
                lastElement.value === '('
            ) {
                if (value !== '-') {
                    setError('Only minus can follow an opening parenthesis')
                    return false
                }
            }

            if (
                type === 'operator' &&
                value === ')' &&
                lastElement.type === 'operator' &&
                lastElement.value !== ')'
            ) {
                setError('Cannot close parenthesis after an operator')
                return false
            }
        }

        setError(null)
        return true
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedSuggestionIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                if (suggestionRefs.current[selectedSuggestionIndex + 1]) {
                    suggestionRefs.current[
                        selectedSuggestionIndex + 1
                    ]?.scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth',
                    })
                }
                return
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedSuggestionIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                if (suggestionRefs.current[selectedSuggestionIndex - 1]) {
                    suggestionRefs.current[
                        selectedSuggestionIndex - 1
                    ]?.scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth',
                    })
                }
                return
            }

            if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                e.preventDefault()
                handleSelectSuggestion(suggestions[selectedSuggestionIndex])
                return
            }

            if (e.key === 'Escape') {
                e.preventDefault()
                setShowSuggestions(false)
                return
            }
        }

        if (e.key === 'Backspace' && inputValue === '' && formula.length > 0) {
            e.preventDefault()
            removeLast()
            return
        }

        if (OPERATORS.includes(e.key)) {
            e.preventDefault()
            if (inputValue) {
                if (validateInput(inputValue, 'number')) {
                    addElement({ type: 'number', value: inputValue })
                    setInputValue('')
                    inputRef.current?.focus()
                } else {
                    return
                }
            }

            if (validateInput(e.key, 'operator')) {
                addElement({ type: 'operator', value: e.key })
            }
            return
        }

        if (e.key === 'Enter' && !showSuggestions) {
            e.preventDefault()

            if (inputValue) {
                const value = inputValue.trim()

                if (!isNaN(Number(value))) {
                    if (validateInput(value, 'number')) {
                        addElement({ type: 'number', value })
                        setInputValue('')
                        inputRef.current?.focus()
                    }
                } else {
                    if (validateInput(value, 'tag')) {
                        addElement({ type: 'tag', value })
                        setInputValue('')
                        inputRef.current?.focus()
                    }
                }
            }
        }
    }

    const handleSelectSuggestion = (suggestion: {
        name: string
        value: number | string
    }) => {
        if (validateInput(suggestion.name, 'tag')) {
            addElement({ type: 'tag', value: suggestion.name })
            setInputValue('')
            setShowSuggestions(false)
            setSelectedSuggestionIndex(-1)

            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }

    const handleTagClick = (index: number) => {
        setActiveTagIndex(index)
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (
            containerRef.current &&
            !containerRef.current.contains(e.target as Node)
        ) {
            setActiveTagIndex(null)
            setShowSuggestions(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div
            className="relative w-full p-6 border border-gray-200 rounded-lg bg-white shadow-lg"
            ref={containerRef}
        >
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2 min-h-12 bg-gray-50 rounded-md border border-gray-200">
                {formula.map((item, index) => (
                    <React.Fragment key={index}>
                        {activeTagIndex === index ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={item.value}
                                    onChange={(e) =>
                                        updateElement(index, e.target.value)
                                    }
                                    autoFocus
                                    onBlur={() => handleTagBlur(index)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setActiveTagIndex(null)
                                        }
                                    }}
                                    className="px-3 py-1.5 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                                />
                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 mt-1 bg-white shadow-md rounded-md w-64 max-h-60 overflow-auto border border-gray-200 left-0">
                                        {suggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex justify-between items-center"
                                                onClick={() => {
                                                    updateElement(
                                                        index,
                                                        suggestion.name
                                                    )
                                                    setActiveTagIndex(null)
                                                }}
                                            >
                                                <span className="font-medium">
                                                    {suggestion.name}
                                                </span>
                                                <span className="text-gray-500">
                                                    ({suggestion.value})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <FormulaTag
                                item={item}
                                index={index}
                                onClick={handleTagClick}
                            />
                        )}
                    </React.Fragment>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md text-sm min-w-40 max-w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder={
                        formula.length === 0
                            ? 'Enter formula...'
                            : 'Continue formula...'
                    }
                />
            </div>

            {showSuggestions && inputValue && (
                <div className="absolute z-10 left-6 right-6 bg-white border border-gray-200 shadow-lg rounded-md max-h-60 overflow-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Loading suggestions...
                        </div>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    suggestionRefs.current[index] = el
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex justify-between items-center border-b border-gray-100 last:border-b-0 ${selectedSuggestionIndex === index ? 'bg-blue-100' : ''}`}
                                onClick={() =>
                                    handleSelectSuggestion(suggestion)
                                }
                                onMouseEnter={() =>
                                    setSelectedSuggestionIndex(index)
                                }
                            >
                                <span className="font-medium">
                                    {suggestion.name}
                                </span>
                                <span className="text-gray-500">
                                    ({suggestion.value})
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">
                            No suggestions found
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 text-sm font-medium text-red-500 flex items-center p-2 bg-red-50 rounded border border-red-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </div>
            )}

            {!error && result !== null && (
                <div className="mt-4 p-2 text-sm font-medium bg-green-50 border border-green-200 rounded flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Result:{' '}
                    <span className="text-green-600 ml-1 font-bold">
                        {result}
                    </span>
                </div>
            )}
        </div>
    )
}
