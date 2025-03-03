import { NextResponse } from 'next/server';

const data = [
    {"name":"name 1","category":"category 1","value":9,"id":"1"},
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    const filteredResults = query
        ? data.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        )
        : data.slice(0, 5);

    return NextResponse.json(filteredResults);
}