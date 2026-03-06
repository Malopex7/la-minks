'use client';

import { useState, useEffect } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Service {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    inputs: any[]; // The dynamic inputs array we just added to the schema
    pricingRule?: any; // The pricing rule containing the extras
}

export default function ServiceSelection() {
    const { data, updateData, nextStep } = useQuoteStore();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch from the backend API, or mock if we don't have it running
    useEffect(() => {
        const fetchServices = async () => {
            try {
                // In a perfect world, our backend GET /api/services would populate the pricingRule or we fetch it separately.
                // For now, we'll fetch services and assume the backend will eventually embed pricingRule.extras
                const res = await fetch('http://localhost:5001/api/services');
                if (!res.ok) throw new Error('Failed to fetch services');
                const json = await res.json();
                setServices(json);
            } catch (err: unknown) {
                console.error(err instanceof Error ? err.message : 'Unknown error');
                // Fallback for demonstration since we are not integrated fully
                setServices([
                    { _id: '1', name: 'Home Cleaning', description: 'Standard whole-home cleaning', basePrice: 400, inputs: [], pricingRule: { extras: [{ name: 'Inside Fridge', price: 150 }, { name: 'Inside Oven', price: 150 }] } },
                    { _id: '2', name: 'Deep Cleaning', description: 'Intensive deep clean for every nook', basePrice: 800, inputs: [], pricingRule: { extras: [{ name: 'Inside Cabinets', price: 200 }] } },
                    { _id: '3', name: 'Move Out Cleaning', description: 'Detailed cleaning before you move out', basePrice: 1000, inputs: [], pricingRule: { extras: [{ name: 'Wall Washing', price: 300 }] } },
                    { _id: '4', name: 'Gardening', description: 'Professional landscaping', basePrice: 600, inputs: [], pricingRule: { extras: [{ name: 'Weed Removal', price: 250 }, { name: 'Green Waste Removal', price: 400 }] } },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleSelect = (service: Service) => {
        // We wipe out existing serviceDetails when switching services to avoid stale answers from a different service's inputs
        updateData({
            serviceId: service._id,
            serviceInputs: service.inputs || [],
            serviceExtras: service.pricingRule?.extras || [],
            aiExtras: [],
            serviceDetails: {},
            extrasSelected: [] // Clear previously selected extras
        });
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
                        className={`cursor-pointer transition-all hover:border-[#d46b4e] hover:shadow-md ${data.serviceId === service._id ? 'border-2 border-[#d46b4e] bg-[#d46b4e]/10' : 'border-slate-200'
                            }`}
                        onClick={() => handleSelect(service)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-slate-800">{service.name}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2">{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-[#d46b4e] font-semibold mt-2">
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
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
