import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../api/activityService';
import { formatDistanceToNow } from 'date-fns';
import { History, ClipboardList, MessageSquare, UserPlus, Milestone } from 'lucide-react';

const ActivityIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'TASK_CREATED': return <ClipboardList className="w-4 h-4 text-emerald-500" />;
        case 'STATUS_CHANGE': return <Milestone className="w-4 h-4 text-blue-500" />;
        case 'COMMENT_ADDED': return <MessageSquare className="w-4 h-4 text-purple-500" />;
        case 'ASSIGNEE_CHANGE': return <UserPlus className="w-4 h-4 text-amber-500" />;
        default: return <History className="w-4 h-4 text-gray-500" />;
    }
};

export const ActivityPanel: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['activities'],
        queryFn: () => activityService.getRecentActivities(0, 15),
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl" />
                ))}
            </div>
        );
    }

    const activities = data?.content || [];

    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {activities.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-sm">No recent activity found.</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="relative pl-8 pb-1 last:pb-0">
                            {/* Vertical Line */}
                            <div className="absolute left-3 top-2 bottom-0 w-px bg-white/10 last:hidden" />

                            {/* Dot/Icon container */}
                            <div className="absolute left-0 top-1 p-1 bg-cyber-black border border-white/10 rounded-lg z-10">
                                <ActivityIcon type={activity.type} />
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    <span className="font-semibold text-white">{activity.user.username}</span>
                                    {' '}{activity.description.replace(`Created task: ${activity.task?.title}`, '').replace(`Changed status of '${activity.task?.title}' to `, '')}
                                    {activity.task && (
                                        <span className="text-emerald-500 font-medium">
                                            {' '}{activity.task.title}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
