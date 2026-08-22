'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchWithAuth, API_URL } from '@/lib/api';

interface Booking {
    _id: string;
    status: string;
    schedule: {
        date: string;
        timeSlot: string;
        estimatedHours: number;
    };
    address: {
        line1: string;
        suburb: string;
        city: string;
    };
    serviceId: {
        name: string;
    };
    customerId: {
        firstName: string;
        lastName: string;
        phone: string;
    };
}

export default function StaffDashboardPage() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchJobs = async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/bookings/staff-assigned`);
                if (!res.ok) throw new Error('Failed to fetch jobs');
                const data = await res.json();
                setBookings(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, [user]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#86a373]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
                <p>Error loading jobs: {error}</p>
            </div>
        );
    }

    // Split jobs
    const todayStr = new Date().toDateString();

    const todaysJobs = bookings.filter(b =>
        b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && new Date(b.schedule?.date).toDateString() === todayStr
    );

    const upcomingJobs = bookings.filter(b =>
        b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && new Date(b.schedule?.date).toDateString() !== todayStr
    );

    const completedJobs = bookings.filter(b => b.status === 'COMPLETED');

    const JobCard = ({ job }: { job: Booking }) => (
        <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${job.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                        job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {job.status.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-lg text-zinc-900">{job.serviceId?.name || 'Cleaning Service'}</h3>
                    <p className="text-zinc-500 text-sm mt-1">{job.customerId?.firstName} {job.customerId?.lastName}</p>
                </div>
                <Link
                    href={`/staff/bookings/${job._id}`}
                    className="p-2 text-[#86a373] hover:bg-[#86a373]/10 rounded-full transition-colors"
                >
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="space-y-2 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>{job.schedule?.date ? format(new Date(job.schedule.date), 'EEEE, MMM do yyyy') : 'No Date'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{job.schedule?.timeSlot || 'Any time'}</span>
                </div>
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{job.address?.line1}, {job.address?.suburb}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My Jobs</h1>
                <p className="text-zinc-500 mt-1">Manage your assigned cleanings and track progress.</p>
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        Today&apos;s Jobs
                        <span className="bg-[#86a373] text-white text-xs px-2 py-0.5 rounded-full">{todaysJobs.length}</span>
                    </h2>
                    {todaysJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {todaysJobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>
                    ) : (
                        <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-8 text-center text-zinc-500">
                            No jobs scheduled for today.
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Upcoming Jobs</h2>
                    {upcomingJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingJobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>
                    ) : (
                        <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-8 text-center text-zinc-500">
                            No upcoming jobs assigned.
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Recently Completed</h2>
                    {completedJobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedJobs.map(job => <JobCard key={job._id} job={job} />)}
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-500 italic">No completed jobs yet.</div>
                    )}
                </section>
            </div>
        </div>
    );
}
