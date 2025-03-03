import React, { useState, useRef, useEffect } from 'react'
import { useFormulaStore } from '@/store/formulaStore'
import { useAutocomplete } from '@/hooks/useAutocomplete'

interface FormulaTagProps {
    item: { type: 'tag' | 'number' | 'operator'; value: string }
    index: number
    onClick: (index: number) => void
}

export const FormulaTag: React.FC<FormulaTagProps> = ({
    item,
    index,
    onClick,
}) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1)
    const { updateElement } = useFormulaStore()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const suggestItemRefs = useRef<(HTMLDivElement | null)[]>([])

    const { data: suggestions = [] } = useAutocomplete(
        item.type === 'tag' ? item.value : ''
    )

    useEffect(() => {
        setSelectedItemIndex(-1)
        suggestItemRefs.current = suggestions.map(() => null)
    }, [suggestions])

    const handleTagClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClick(index)

        if (item.type === 'tag') {
            setShowDropdown(!showDropdown)
        }
    }

    const handleSelectDropdownItem = (newValue: string) => {
        updateElement(index, newValue)
        setShowDropdown(false)
        setSelectedItemIndex(-1)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!showDropdown || suggestions.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedItemIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            )
            if (suggestItemRefs.current[selectedItemIndex + 1]) {
                suggestItemRefs.current[selectedItemIndex + 1]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                })
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedItemIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            )
            if (suggestItemRefs.current[selectedItemIndex - 1]) {
                suggestItemRefs.current[selectedItemIndex - 1]?.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth',
                })
            }
        } else if (e.key === 'Enter' && selectedItemIndex >= 0) {
            e.preventDefault()
            handleSelectDropdownItem(suggestions[selectedItemIndex].name)
        } else if (e.key === 'Escape') {
            e.preventDefault()
            setShowDropdown(false)
        }
    }

    useEffect(() => {
        if (showDropdown) {
            window.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [showDropdown, selectedItemIndex, suggestions])

    const getTagStyle = () => {
        switch (item.type) {
            case 'tag':
                return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
            case 'number':
                return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
            case 'operator':
                return 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
        }
    }

    return (
        <div className="relative inline-block">
            <span
                className={`inline-flex items-center px-3 py-1.5 rounded-md border text-sm font-medium transition-colors duration-200 cursor-pointer ${getTagStyle()}`}
                onClick={handleTagClick}
                tabIndex={0}
                role="button"
                aria-expanded={showDropdown}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleTagClick(e as unknown as React.MouseEvent)
                    }
                }}
            >
                {item.type === 'tag' ? (
                    <>
                        <span className="mr-1.5 text-blue-600">⊡</span>
                        <span>{item.value}</span>
                        <span className="ml-1.5 text-xs text-blue-600">▼</span>
                    </>
                ) : (
                    <span
                        className={
                            item.type === 'operator' ? 'font-bold px-1' : ''
                        }
                    >
                        {item.value}
                    </span>
                )}
            </span>

            {showDropdown && item.type === 'tag' && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 mt-1 w-64 max-h-60 overflow-auto z-10 bg-white border border-gray-200 rounded-md shadow-lg"
                    role="listbox"
                >
                    {suggestions.length > 0 ? (
                        suggestions.map((suggestion, idx) => (
                            <div
                                key={idx}
                                ref={(el) => {
                                    suggestItemRefs.current[idx] = el
                                }}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between items-center ${selectedItemIndex === idx ? 'bg-blue-100' : ''}`}
                                onClick={() =>
                                    handleSelectDropdownItem(suggestion.name)
                                }
                                onMouseEnter={() => setSelectedItemIndex(idx)}
                                role="option"
                                aria-selected={selectedItemIndex === idx}
                                tabIndex={-1}
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
                        <div className="px-4 py-2 text-sm text-gray-500">
                            No suggestions found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
