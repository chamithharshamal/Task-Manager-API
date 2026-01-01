import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class SocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, any> = new Map();

    connect(onConnect: () => void) {
        if (this.client?.active) return;

        this.client = new Client({
            webSocketFactory: () => new SockJS(SOCKET_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                onConnect();
            },
            onStompError: (frame: any) => {
                console.error('STOMP error', frame.headers['message']);
            },
        });

        this.client.activate();
    }

    subscribe(topic: string, callback: (message: any) => void) {
        if (!this.client?.connected) {
            console.warn('Cannot subscribe, not connected');
            return;
        }

        if (this.subscriptions.has(topic)) return;

        const subscription = this.client.subscribe(topic, (message: any) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, subscription);
        return subscription;
    }

    unsubscribe(topic: string) {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(topic);
        }
    }

    disconnect() {
        this.client?.deactivate();
        this.client = null;
        this.subscriptions.clear();
    }
}

export const socketService = new SocketService();
