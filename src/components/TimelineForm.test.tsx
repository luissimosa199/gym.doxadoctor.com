import { act, fireEvent, render, screen } from '@testing-library/react'
import TimelineForm from './TimelineForm'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom'
import fetchMock from 'jest-fetch-mock';
import { SessionProvider } from 'next-auth/react';

global.fetch = fetchMock as any;

const queryClient = new QueryClient();

describe('TimelineForm', () => {

    it('does not submit when form is empty', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ /* your expected response here */ }));
        const session = { user: { name: 'user1', email: 'user1@domain.com' }, expires: '2023-09-02T14:57:44.893Z' }

        await act(async () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <SessionProvider session={session}>
                        <TimelineForm />
                    </SessionProvider>
                </QueryClientProvider>
            );
        });

        await act(async () => {
            const submitBtn = screen.getByRole('button', { name: 'Enviar' });
            fireEvent.click(submitBtn);
        });

        expect(fetchMock).not.toHaveBeenCalledTimes(2);

        fetchMock.resetMocks();
    });

    // more test

    afterEach(() => {
        fetchMock.resetMocks();
    });
})