import React, { FunctionComponent } from 'react';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoriesList from './CategoriesList'; // adjust the import path if needed
import fetchMock from 'jest-fetch-mock';
import { mockCategories } from '../../moks/getCategoriesResponseMock';
import { fetchCategories } from '@/utils/getCategories';

const queryClient = new QueryClient();

const renderWithQueryClient = (Component: FunctionComponent) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <Component />
        </QueryClientProvider>
    );
};

describe("CategoriesList", () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it("should display loading message while fetching categories", async () => {
        fetchMock.mockResponseOnce(() =>
            new Promise(resolve =>
                setTimeout(() =>
                    resolve({ body: JSON.stringify(mockCategories) }), 100)
            )
        );

        await act(async () => {
            renderWithQueryClient(CategoriesList);
        });

        expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

});
