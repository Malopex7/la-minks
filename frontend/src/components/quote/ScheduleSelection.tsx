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

    // Calculate dynamic time slots based on estimated hours locally
    // since the final backend quote hasn't been fetched yet.
    let estimatedHours = 2; // Base estimated hours

    // Add 30 mins for every counted unit (like bedrooms or bathrooms) matches backend logic
    if (data.serviceDetails) {
        Object.values(data.serviceDetails).forEach(val => {
            const numVal = Number(val);
            if (!isNaN(numVal) && numVal > 0 && numVal < 50) {
                estimatedHours += (numVal * 0.5);
            }
        });
    }

    // Add time for standard extras
    if (data.extrasSelected && data.extrasSelected.length > 0) {
        data.extrasSelected.forEach(extraName => {
            const extraConfig = data.serviceExtras.find(e => e.name === extraName);
            if (extraConfig && extraConfig.estimatedAdditionalHours) {
                estimatedHours += extraConfig.estimatedAdditionalHours;
            } else {
                estimatedHours += 0.5; // Fallback 30 mins per extra
            }
        });
    }

    // Add time for AI extras
    if (data.aiExtras && data.aiExtras.length > 0) {
        data.aiExtras.forEach(extra => {
            if (extra.estimatedAdditionalHours) {
                estimatedHours += extra.estimatedAdditionalHours;
            } else {
                estimatedHours += 0.5;
            }
        });
    }

    // Generate slots from 8 AM to 6 PM (18:00)
    const generateTimeSlots = () => {
        const slots: string[] = [];
        const startHour = 8;
        const endHour = 18; // 6 PM
        const maxWorkingHours = endHour - startHour;

        // Cap the block size to a full working day max so we don't end up with 0 slots
        const slotDuration = Math.min(estimatedHours, maxWorkingHours);

        let currentHour = startHour;

        while (currentHour + slotDuration <= endHour) {
            const periodStart = currentHour >= 12 ? 'PM' : 'AM';
            let displayStartHour = currentHour > 12 ? currentHour - 12 : currentHour;
            const startString = `${displayStartHour.toString().padStart(2, '0')}:00 ${periodStart}`;

            const endTime = currentHour + Math.ceil(slotDuration);
            const periodEnd = endTime >= 12 ? 'PM' : 'AM';
            let displayEndHour = endTime > 12 ? endTime - 12 : endTime;
            const endString = `${displayEndHour.toString().padStart(2, '0')}:00 ${periodEnd}`;

            // Add an indicator if the job is too big for one calendar day
            const multiDayNote = estimatedHours > maxWorkingHours ? ' (Multi-day job)' : '';
            slots.push(`${startString} - ${endString}${multiDayNote}`);

            // Advance by 1 hour for maximum flexibility
            currentHour += Math.max(1, Math.floor(slotDuration / 2));
        }

        // Failsafe: if we somehow generated 0 slots (e.g., extremely weird inputs), just give a full day slot
        if (slots.length === 0) {
            slots.push('08:00 AM - 06:00 PM (Full Day)');
        }

        return slots;
    };

    const timeSlots = generateTimeSlots();

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
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Review Quote
                </Button>
            </div>
        </div>
    );
}
