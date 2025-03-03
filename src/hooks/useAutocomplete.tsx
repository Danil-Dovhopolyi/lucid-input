import { useQuery } from '@tanstack/react-query';

interface SuggestionItem {
    name: string;
    category: string;
    value: number | string;
    id: string;
    inputs?: string;
}

const fetchSuggestions = async (query: string): Promise<SuggestionItem[]> => {
    try {
        const hardcodedData: SuggestionItem[] = [
            {"name":"name 1","category":"category 1","value":9,"id":"1"},
            {"name":"name 2","category":"category 2","value":16,"id":"2"},
            {"name":"name 3","category":"category 3","value":95,"id":"3"},
            {"name":"name 4","category":"category 4","value":3,"id":"4"},
            {"name":"name 5","category":"category 5","value":51,"id":"5"},
        ];

        if (query) {
            return hardcodedData.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.category.toLowerCase().includes(query.toLowerCase())
            );
        }

        return hardcodedData.slice(0, 5);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
};

export const useAutocomplete = (query: string) => {
    return useQuery<SuggestionItem[]>({
        queryKey: ['autocomplete', query],
        queryFn: () => fetchSuggestions(query),
        enabled: true,
        staleTime: 60000,
        refetchOnWindowFocus: false,
    });
};