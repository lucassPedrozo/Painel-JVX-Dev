"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import * as React from "react"

export const description = "A radar chart with dots"

function useRadarData() {
    const [data, setData] = React.useState<{ dev: string; total: number }[]>([])

    React.useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        fetch(`${API_URL}/works`)
            .then((res) => res.json())
            .then((works: any[]) => {
                const grouped: Record<string, number> = {}
                works.forEach((w) => {
                    const dev = w.developer || "Sem nome"
                    grouped[dev] = (grouped[dev] || 0) + 1
                })

                const arr = Object.entries(grouped).map(([dev, total]) => ({
                    dev,
                    total,
                }))

                setData(arr)
            })
            .catch(err => console.error('Erro ao carregar dados do radar:', err))
    }, [])

    return data
}

const chartConfig = {
    total: {
        label: "Projetos",
        color: "var(--chart-1)",
    },
} 

export function ChartRadarDots() {
    const data = useRadarData()

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="items-center pb-2">
                <CardTitle>Projetos por Desenvolvedor</CardTitle>
                <CardDescription>Distribuição dos projetos atribuídos</CardDescription>
            </CardHeader>
            <CardContent className="pb-0 flex-1 flex items-center justify-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full"
                >
                    <RadarChart data={data}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <PolarAngleAxis dataKey="dev" />
                        <PolarGrid />
                        <Radar
                            dataKey="total"
                            stroke="var(--chart-1)"
                            fill="var(--chart-1)"
                            fillOpacity={0.6}
                            dot={{
                                r: 4,
                                fill: "var(--chart-1)",
                                stroke: "#fff",
                                strokeWidth: 1.5,
                            }}
                        />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm pt-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Devs do mês <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    {data.length > 0 ? data.map((d) => d.dev).join(", ") : "Sem dados"}
                </div>
            </CardFooter>
        </Card>
    )
}
