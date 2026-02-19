"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import type { QueryResult } from "@shared/types/report.types";

interface ExecutionState {
    isExecuting: boolean;
    result: QueryResult | null;
    error: string | null;
}

export function useSqlExecution() {
    const [ state, setState ] = useState<ExecutionState>({
        isExecuting: false,
        result: null,
        error: null,
    });

    const executeQuery = async (query: string) => {
        if (!query.trim()) {
            setState((prev) => ({
                ...prev,
                error: "Query cannot be empty",
            }));
            return;
        }

        setState({
            isExecuting: true,
            result: null,
            error: null,
        });

        try {
            const response = await api.post<{
                success: boolean;
                data: QueryResult;
            }>("/reports/execute", { query });

            setState({
                isExecuting: false,
                result: response.data.data,
                error: null,
            });

            return response.data.data;
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to execute query";

            setState({
                isExecuting: false,
                result: null,
                error: errorMessage,
            });

            throw err;
        }
    };

    const reset = () => {
        setState({
            isExecuting: false,
            result: null,
            error: null,
        });
    };

    return {
        executeQuery,
        reset,
        ...state,
    };
}
