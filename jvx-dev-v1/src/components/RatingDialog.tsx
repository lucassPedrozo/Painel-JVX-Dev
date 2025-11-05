import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RatingStars } from '@/components/RatingStars'
import { type Work } from '@/lib/api'
import { Star } from 'lucide-react'

interface RatingDialogProps {
  work: Work | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (ratings: {
    rating_aparencia: number
    rating_complexidade: number
    rating_satisfacao: number
    rating_material: number
    rating_observacoes: string
  }) => void
}

export function RatingDialog({ work, open, onOpenChange, onSave }: RatingDialogProps) {
  const [aparencia, setAparencia] = useState(work?.rating_aparencia || 0)
  const [complexidade, setComplexidade] = useState(work?.rating_complexidade || 0)
  const [satisfacao, setSatisfacao] = useState(work?.rating_satisfacao || 0)
  const [material, setMaterial] = useState(work?.rating_material || 0)
  const [observacoes, setObservacoes] = useState(work?.rating_observacoes || '')

  const handleSave = () => {
    if (aparencia === 0 || complexidade === 0 || satisfacao === 0 || material === 0) {
      alert('Por favor, avalie todos os critérios')
      return
    }

    onSave({
      rating_aparencia: aparencia,
      rating_complexidade: complexidade,
      rating_satisfacao: satisfacao,
      rating_material: material,
      rating_observacoes: observacoes
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avaliar Projeto
          </DialogTitle>
          <DialogDescription>
            Avalie os diferentes aspectos do projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Aparência */}
          <div className="space-y-2">
            <Label>Aparência</Label>
            <div className="flex items-center gap-3">
              <RatingStars
                rating={aparencia}
                interactive
                onChange={setAparencia}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {aparencia > 0 ? `${aparencia}/5` : 'Não avaliado'}
              </span>
            </div>
          </div>

          {/* Complexidade */}
          <div className="space-y-2">
            <Label>Complexidade</Label>
            <div className="flex items-center gap-3">
              <RatingStars
                rating={complexidade}
                interactive
                onChange={setComplexidade}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {complexidade > 0 ? `${complexidade}/5` : 'Não avaliado'}
              </span>
            </div>
          </div>

          {/* Satisfação do Cliente */}
          <div className="space-y-2">
            <Label>Satisfação do Cliente</Label>
            <div className="flex items-center gap-3">
              <RatingStars
                rating={satisfacao}
                interactive
                onChange={setSatisfacao}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {satisfacao > 0 ? `${satisfacao}/5` : 'Não avaliado'}
              </span>
            </div>
          </div>

          {/* Material Encaminhado */}
          <div className="space-y-2">
            <Label>Material Encaminhado</Label>
            <div className="flex items-center gap-3">
              <RatingStars
                rating={material}
                interactive
                onChange={setMaterial}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {material > 0 ? `${material}/5` : 'Não avaliado'}
              </span>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Comentários adicionais sobre a avaliação..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Salvar Avaliação
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
