import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../api/socketService';

export const useWebSocket = (topic?: string, queryKeyToInvalidate?: any[]) => {
    const queryClient = useQueryClient();

    const handleMessage = useCallback(() => {
        if (queryKeyToInvalidate) {
            queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
        }
    }, [queryClient, queryKeyToInvalidate]);

    useEffect(() => {
        socketService.connect(() => {
            if (topic) {
                socketService.subscribe(topic, handleMessage);
            }
        });

        return () => {
            if (topic) {
                socketService.unsubscribe(topic);
            }
        };
    }, [topic, handleMessage]);
};
