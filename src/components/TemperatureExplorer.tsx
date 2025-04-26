
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const cities = {
  Elobour: {
    name: 'Al Obour',
    coords: { lat: 30.1933, lon: 31.4603 }
  },
  October: {
    name: 'Madīnat Sittah Uktūbar',
    coords: { lat: 29.9361, lon: 30.9269 }
  }
};

const TemperatureExplorer = () => {
  const [selectedCity, setSelectedCity] = useState('Elobour');
  const [date, setDate] = useState<Date>(new Date());
  const [temperatureData, setTemperatureData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForAPI = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  const getTemperature = async () => {
    setIsLoading(true);
    try {
      const city = cities[selectedCity as keyof typeof cities];
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let apiUrl: string;
      let maxTemp: string;
      let minTemp: string;
      let dataSource: string;

      if (selectedDate < today) {
        apiUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.coords.lat}&longitude=${city.coords.lon}&start_date=${formatDateForAPI(selectedDate)}&end_date=${formatDateForAPI(selectedDate)}&hourly=temperature_2m&timeformat=unixtime`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) throw new Error(data.reason);
        if (!data.hourly.temperature_2m.length) throw new Error('No historical data available');
        
        const temps = data.hourly.temperature_2m;
        maxTemp = Math.max(...temps).toFixed(1);
        minTemp = Math.min(...temps).toFixed(1);
        dataSource = 'Historical Data';
      } else {
        apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.coords.lat}&longitude=${city.coords.lon}&daily=temperature_2m_max,temperature_2m_min&start_date=${formatDateForAPI(selectedDate)}&end_date=${formatDateForAPI(selectedDate)}&timezone=auto`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.error) throw new Error(data.reason);
        maxTemp = data.daily.temperature_2m_max[0].toFixed(1);
        minTemp = data.daily.temperature_2m_min[0].toFixed(1);
        dataSource = selectedDate.getTime() === today.getTime() ? 'Current Day Data' : 'Forecast Data';
      }

      setTemperatureData({ maxTemp, minTemp, dataSource });
      toast.success("Temperature data retrieved successfully!");
    } catch (err: any) {
      toast.error(err.message);
      setTemperatureData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <Card className="max-w-md mx-auto mt-8 bg-white/90 backdrop-blur">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">
            Egypt Cities Temperature
          </h1>

          <div className="space-y-6">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Elobour">Al Obour</SelectItem>
                <SelectItem value="October">Madīnat Sittah Uktūbar</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={getTemperature}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Get Temperature"}
            </Button>

            {temperatureData && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-center text-green-700">
                  {cities[selectedCity as keyof typeof cities].name}
                </h2>
                <p className="text-center text-gray-600">
                  {format(date, 'yyyy-MM-dd')}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600">Max</p>
                    <p className="text-2xl font-bold text-green-600">
                      {temperatureData.maxTemp}°C
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600">Min</p>
                    <p className="text-2xl font-bold text-green-600">
                      {temperatureData.minTemp}°C
                    </p>
                  </div>
                </div>
                
                <p className="text-center text-sm text-gray-500 italic">
                  {temperatureData.dataSource}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemperatureExplorer;
