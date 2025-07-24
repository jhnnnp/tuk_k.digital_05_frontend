import { MotionEvent, PaginatedResponse, EventFilters } from '../types';
import eventData from '../mocks/events.json';

class EventService {
    private baseUrl: string;
    private isMockMode: boolean;

    constructor() {
        this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.tibo.com';
        this.isMockMode = process.env.NODE_ENV === 'development' || !process.env.EXPO_PUBLIC_API_URL;
    }

    // Get events with filtering and pagination
    async getEvents(
        cameraId?: string,
        filters?: EventFilters,
        page: number = 1,
        limit: number = 20
    ): Promise<PaginatedResponse<MotionEvent>> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 600));

                let filteredEvents = eventData.events.map(event => ({
                    ...event,
                    timestamp: new Date(event.timestamp)
                }));

                // Apply camera filter
                if (cameraId) {
                    filteredEvents = filteredEvents.filter(event => event.cameraId === cameraId);
                }

                // Apply type filter
                if (filters?.type && filters.type.length > 0) {
                    filteredEvents = filteredEvents.filter(event =>
                        filters.type!.includes(event.type)
                    );
                }

                // Apply date range filter
                if (filters?.dateRange) {
                    filteredEvents = filteredEvents.filter(event => {
                        const eventDate = new Date(event.timestamp);
                        return eventDate >= filters.dateRange!.start &&
                            eventDate <= filters.dateRange!.end;
                    });
                }

                // Apply acknowledged filter
                if (filters?.acknowledged !== undefined) {
                    filteredEvents = filteredEvents.filter(event =>
                        event.isAcknowledged === filters.acknowledged
                    );
                }

                // Apply confidence filter
                if (filters?.confidence) {
                    filteredEvents = filteredEvents.filter(event =>
                        event.confidence >= filters.confidence!
                    );
                }

                // Sort by timestamp (newest first)
                filteredEvents.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                // Apply pagination
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

                return {
                    data: paginatedEvents,
                    pagination: {
                        page,
                        limit,
                        total: filteredEvents.length,
                        totalPages: Math.ceil(filteredEvents.length / limit)
                    }
                };
            }

            const params = new URLSearchParams();
            if (cameraId) params.append('cameraId', cameraId);
            if (filters?.type) params.append('type', filters.type.join(','));
            if (filters?.acknowledged !== undefined) params.append('acknowledged', filters.acknowledged.toString());
            if (filters?.confidence) params.append('confidence', filters.confidence.toString());
            if (filters?.dateRange) {
                params.append('startDate', filters.dateRange.start.toISOString());
                params.append('endDate', filters.dateRange.end.toISOString());
            }
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const response = await fetch(`${this.baseUrl}/api/events?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw new Error('Failed to fetch events');
        }
    }

    // Get specific event
    async getEvent(id: string): Promise<MotionEvent> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const event = eventData.events.find(e => e.id === id);
                if (!event) {
                    throw new Error('Event not found');
                }
                return {
                    ...event,
                    timestamp: new Date(event.timestamp)
                };
            }

            const response = await fetch(`${this.baseUrl}/api/events/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.event;
        } catch (error) {
            console.error(`Error fetching event ${id}:`, error);
            throw new Error('Failed to fetch event');
        }
    }

    // Acknowledge event
    async acknowledgeEvent(id: string): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 400));
                console.log(`Mock: Acknowledged event ${id}`);
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/events/${id}/acknowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error acknowledging event ${id}:`, error);
            throw new Error('Failed to acknowledge event');
        }
    }

    // Mark event as false positive
    async markFalsePositive(id: string): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 400));
                console.log(`Mock: Marked event ${id} as false positive`);
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/events/${id}/false-positive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error marking event ${id} as false positive:`, error);
            throw new Error('Failed to mark event as false positive');
        }
    }

    // Delete event
    async deleteEvent(id: string): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 500));
                console.log(`Mock: Deleted event ${id}`);
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error deleting event ${id}:`, error);
            throw new Error('Failed to delete event');
        }
    }

    // Get event statistics
    async getEventStats(cameraId?: string, dateRange?: { start: Date; end: Date }): Promise<{
        total: number;
        byType: Record<string, number>;
        byCamera: Record<string, number>;
        acknowledged: number;
        falsePositives: number;
    }> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 400));

                let events = eventData.events;

                if (cameraId) {
                    events = events.filter(event => event.cameraId === cameraId);
                }

                if (dateRange) {
                    events = events.filter(event => {
                        const eventDate = new Date(event.timestamp);
                        return eventDate >= dateRange.start && eventDate <= dateRange.end;
                    });
                }

                const byType = events.reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const byCamera = events.reduce((acc, event) => {
                    acc[event.cameraId] = (acc[event.cameraId] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const acknowledged = events.filter(event => event.isAcknowledged).length;
                const falsePositives = events.filter(event => event.isFalsePositive).length;

                return {
                    total: events.length,
                    byType,
                    byCamera,
                    acknowledged,
                    falsePositives
                };
            }

            const params = new URLSearchParams();
            if (cameraId) params.append('cameraId', cameraId);
            if (dateRange) {
                params.append('startDate', dateRange.start.toISOString());
                params.append('endDate', dateRange.end.toISOString());
            }

            const response = await fetch(`${this.baseUrl}/api/events/stats?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error('Error fetching event statistics:', error);
            throw new Error('Failed to fetch event statistics');
        }
    }

    // Bulk acknowledge events
    async bulkAcknowledge(eventIds: string[]): Promise<void> {
        try {
            if (this.isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 800));
                console.log(`Mock: Bulk acknowledged events`, eventIds);
                return;
            }

            const response = await fetch(`${this.baseUrl}/api/events/bulk-acknowledge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify({ eventIds })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error bulk acknowledging events:', error);
            throw new Error('Failed to bulk acknowledge events');
        }
    }

    // Private method to get auth token
    private async getAuthToken(): Promise<string> {
        // In a real app, this would get the token from secure storage
        return 'mock-token';
    }
}

export const eventService = new EventService(); 