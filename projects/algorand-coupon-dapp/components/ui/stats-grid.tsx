import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatItem {
  label: string
  value: string | number
  icon: LucideIcon
  gradient: string
  description?: string
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: number
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(columns, 4)} gap-4 mb-6`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`bg-gradient-to-br ${stat.gradient} shadow-lg`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.description && <p className="text-xs opacity-70 mt-1">{stat.description}</p>}
                </div>
                <div className="p-2 bg-white/20 rounded-full">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
