"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export const description = "An interactive bar chart"

function useChartData() {
    const [chartData, setChartData] = React.useState<{ date: string, all: number }[]>([])
    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        fetch(`${API_URL}/works`)
            .then(res => res.json())
            .then((data: any[]) => {
                const grouped: Record<string, { all: number }> = {}
                data.forEach((item) => {
                    const d = new Date(item.date)
                    const dateStr = d.toISOString().slice(0, 10)
                    if (!grouped[dateStr]) grouped[dateStr] = { all: 0 }
                    grouped[dateStr].all += 1
                })
                let arr = Object.entries(grouped).map(([date, val]) => ({ date, ...val }))
                arr.sort((a, b) => a.date.localeCompare(b.date))

                setChartData(arr)
            })
            .catch(err => console.error('Erro ao carregar dados do gráfico:', err))
    }, [])
    return chartData
}

const chartConfig = {
    days: {
        label: "Período Selecionado",
        color: "#6366f1",
    },
    all: {
        label: "Todos os projetos",
        color: "#22c55e",
    },
}

type PeriodType = "15" | "30" | "60" | "120" | "custom" | "all"

export function ChartBarInteractive() {
    const [period, setPeriod] = React.useState<PeriodType>("15")
    const [customDays, setCustomDays] = React.useState<string>("15")
    const chartData = useChartData()

    const filteredData = React.useMemo(() => {
        if (period === "all") return chartData

        const days = period === "custom" ? parseInt(customDays) || 15 : parseInt(period)
        const today = new Date()
        const cutoff = new Date(today)
        cutoff.setDate(today.getDate() - (days - 1))
        return chartData.filter(d => new Date(d.date) >= cutoff)
    }, [chartData, period, customDays])

    const total = React.useMemo(() => {
        return filteredData.reduce((acc, curr) => acc + curr.all, 0)
    }, [filteredData])

    const getPeriodLabel = () => {
        if (period === "all") return "Todos os projetos"
        if (period === "custom") return `Últimos ${customDays} dias`
        return `Últimos ${period} dias`
    }

    return (
        <Card className="py-0 shadow-lg border border-border bg-background/80 backdrop-blur rounded-xl">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 bg-muted/50 rounded-t-xl">
                <div className="flex flex-col sm:flex-row items-stretch">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-5">
                        <CardTitle className="text-xl sm:text-2xl font-bold dark:text-white-300">Resumo dos Projetos</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Visualize a evolução diária dos projetos cadastrados.
                        </CardDescription>
                    </div>
                    
                    <div className="flex flex-col gap-2 px-6 pb-4 sm:py-5 sm:px-6 sm:border-l border-border">
                        <div className="flex items-center gap-2">
                            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                                    <SelectItem value="120">Últimos 120 dias</SelectItem>
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                    <SelectItem value="all">Todos os projetos</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            {period === "custom" && (
                                <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={customDays}
                                    onChange={(e) => setCustomDays(e.target.value)}
                                    placeholder="Dias"
                                    className="w-20"
                                />
                            )}
                        </div>
                        
                        <div className="text-center sm:text-left">
                            <span className="text-xs text-muted-foreground">{getPeriodLabel()}</span>
                            <span className="block text-2xl sm:text-3xl font-bold mt-1">
                                {total.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={filteredData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                        barCategoryGap={16}
                        barGap={2}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("pt-BR", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                            className="text-xs text-muted-foreground"
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="all"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("pt-BR", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey="all"
                            fill={period === "all" ? chartConfig.all.color : chartConfig.days.color}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
