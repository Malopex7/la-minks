'use client';

import { useQuoteStore } from '@/store/useQuoteStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ScheduleSelection() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const handleDateSelect = (date: Date | undefined) => {
        updateData({
            schedule: {
                ...data.schedule,
                date,
            },
        });
    };

    const handleTimeSelect = (timeSlot: string) => {
        updateData({
            schedule: {
                ...data.schedule,
                timeSlot,
            },
        });
    };

    const timeSlots = [
        '08:00 AM - 10:00 AM',
        '10:00 AM - 12:00 PM',
        '12:00 PM - 02:00 PM',
        '02:00 PM - 04:00 PM',
        '04:00 PM - 06:00 PM',
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">When do you need us?</h2>
                <p className="text-slate-500">Pick a date and time that works best for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Select Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal h-12',
                                    !data.schedule.date && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {data.schedule.date ? format(data.schedule.date, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-slate-200">
                            <Calendar
                                mode="single"
                                selected={data.schedule.date}
                                onSelect={handleDateSelect}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Select Time</label>
                    <Select
                        onValueChange={handleTimeSelect}
                        value={data.schedule.timeSlot}
                        disabled={!data.schedule.date}
                    >
                        <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                    {slot}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {!data.schedule.date && (
                        <p className="text-xs text-slate-500 mt-1">Please select a date first</p>
                    )}
                </div>
            </div>

            <div className="pt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={!data.schedule.date || !data.schedule.timeSlot}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Review Quote
                </Button>
            </div>
        </div>
    );
}
