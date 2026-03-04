'use client';

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ServiceSelection() {
    const { data, updateData, nextStep } = useQuoteStore();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch from the backend API, or mock if we don't have it running
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (!res.ok) throw new Error('Failed to fetch services');
                const json = await res.json();
                setServices(json);
            } catch (err: any) {
                setError(err.message);
                // Fallback for demonstration since we are not integrated fully
                setServices([
                    { _id: '1', name: 'Home Cleaning', description: 'Standard whole-home cleaning', basePrice: 400 },
                    { _id: '2', name: 'Deep Cleaning', description: 'Intensive deep clean for every nook', basePrice: 800 },
                    { _id: '3', name: 'Move Out Cleaning', description: 'Detailed cleaning before you move out', basePrice: 1000 },
                    { _id: '4', name: 'Office Cleaning', description: 'Commercial cleaning for offices', basePrice: 600 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSelect = (serviceId: string) => {
        updateData({ serviceId });
    };

    if (loading) return <div className="text-center py-10 text-slate-500">Loading services...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">What do you need cleaned?</h2>
                <p className="text-slate-500">Select the type of service you are looking for.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                    <Card
                        key={service._id}
                        className={`cursor-pointer transition-all hover:border-blue-500 hover:shadow-md ${data.serviceId === service._id ? 'border-2 border-blue-600 bg-blue-50' : 'border-slate-200'
                            }`}
                        onClick={() => handleSelect(service._id)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-slate-800">{service.name}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2">{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-blue-600 font-semibold mt-2">
                                Starts at R{service.basePrice}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="pt-6 flex justify-end">
                <Button
                    onClick={nextStep}
                    disabled={!data.serviceId}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
