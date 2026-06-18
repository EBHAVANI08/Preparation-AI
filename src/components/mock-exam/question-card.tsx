'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { AnswerValue, Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  FileText, Mic, Volume2, AlertTriangle, Award, Check, Plus, Minus, Gauge,
} from 'lucide-react';

interface Props {
  question: Question;
  index: number;
  total: number;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Defensively converts any option value (string, array, number, nested array)
 * to a clean display string. Handles the legacy nested-array data bug
 * where options sometimes came back like ["A", ["B", "extra"]] etc.
 */
function renderOption(opt: unknown): string {
  if (opt === null || opt === undefined) return '';
  if (typeof opt === 'string') return opt;
  if (typeof opt === 'number') {
    // Clean numeric display — no FP noise
    const rounded = Math.round(opt * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }
  if (Array.isArray(opt)) {
    // Flatten any nesting and join non-empty parts
    const flat: string[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (typeof v === 'string') {
        if (v.trim()) flat.push(v);
      } else if (typeof v === 'number') {
        flat.push(renderOption(v));
      } else if (v !== null && v !== undefined) {
        flat.push(String(v));
      }
    };
    walk(opt);
    return flat.join(' ');
  }
  if (typeof opt === 'object') {
    try { return JSON.stringify(opt); } catch { return ''; }
  }
  return String(opt);
}

function difficultyStyle(d: Question['difficulty']): { label: string; cls: string } {
  switch (d) {
    case 'easy': return { label: 'Easy', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'medium': return { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'hard': return { label: 'Hard', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    default: return { label: d, cls: 'bg-stone-50 text-stone-700 border-stone-200' };
  }
}

export function QuestionCard({ question, index, total, value, onChange }: Props) {
  const diff = difficultyStyle(question.difficulty);
  const isMSQ = question.type === 'msq';
  const isChoice = question.type === 'mcq' || question.type === 'reading' || question.type === 'listening';
  const isNumeric = question.type === 'numerical';
  const isDescriptive = question.type === 'descriptive' || question.type === 'writing';
  const isSpeaking = question.type === 'speaking';

  const options = (question.options || []).map(renderOption);
  const selectedIndices: number[] =
    value && (value.type === 'mcq' || value.type === 'reading' || value.type === 'listening')
      ? [value.optionIndex]
      : value && value.type === 'msq'
        ? value.optionIndices
        : [];

  function toggleMSQ(idx: number) {
    const cur = new Set(selectedIndices);
    if (cur.has(idx)) cur.delete(idx); else cur.add(idx);
    onChange({ type: 'msq', optionIndices: Array.from(cur).sort((a, b) => a - b) });
  }

  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-600 text-white">
            <FileText className="h-3 w-3" /> Q {index + 1} / {total}
          </Badge>
          <Badge variant="outline" className="border-stone-300">{question.subject}</Badge>
          <Badge variant="outline" className="border-stone-300">{question.topic}</Badge>
          <Badge variant="outline" className={cn('border', diff.cls)}>
            <Gauge className="h-3 w-3" /> {diff.label}
          </Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
              <Plus className="h-3 w-3" /> +{question.marks}
            </Badge>
            {question.negativeMarks > 0 && (
              <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">
                <Minus className="h-3 w-3" /> -{question.negativeMarks}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Passage */}
        {question.passage && (
          <div className="rounded-md border border-teal-200 bg-teal-50/60 p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-700" />
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Passage</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">{question.passage}</p>
          </div>
        )}

        {/* Media label */}
        {question.mediaLabel && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex items-center gap-2.5">
            <Volume2 className="h-4 w-4 text-amber-700 flex-shrink-0" />
            <span className="text-sm text-amber-900">{question.mediaLabel}</span>
          </div>
        )}

        {/* Question text */}
        <p className="text-base leading-relaxed font-medium text-stone-900 whitespace-pre-wrap">
          {question.text}
        </p>

        {/* Answer input */}
        <AnswerInput
          question={question}
          options={options}
          isChoice={isChoice}
          isMSQ={isMSQ}
          isNumeric={isNumeric}
          isDescriptive={isDescriptive}
          isSpeaking={isSpeaking}
          value={value}
          selectedIndices={selectedIndices}
          onChange={onChange}
          toggleMSQ={toggleMSQ}
        />

        {/* Hint / unit */}
        {question.unit && isNumeric && (
          <p className="text-xs text-muted-foreground">Unit: {question.unit}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface AnswerInputProps {
  question: Question;
  options: string[];
  isChoice: boolean;
  isMSQ: boolean;
  isNumeric: boolean;
  isDescriptive: boolean;
  isSpeaking: boolean;
  value: AnswerValue;
  selectedIndices: number[];
  onChange: (v: AnswerValue) => void;
  toggleMSQ: (idx: number) => void;
}

function AnswerInput({
  question, options, isChoice, isMSQ, isNumeric, isDescriptive, isSpeaking,
  value, selectedIndices, onChange, toggleMSQ,
}: AnswerInputProps) {
  if ((isChoice || isMSQ) && options.length > 0) {
    return (
      <div className="space-y-2">
        {isMSQ && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            Multiple correct answers possible. Select all that apply.
          </p>
        )}
        <div className="space-y-2">
          {options.map((opt, idx) => {
            const selected = selectedIndices.includes(idx);
            return (
              <label
                key={idx}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-all',
                  selected
                    ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50',
                )}
              >
                {isChoice && !isMSQ ? (
                  <RadioGroup
                    value={selectedIndices[0] !== undefined ? String(selectedIndices[0]) : ''}
                    onValueChange={(v) => onChange({
                      type: question.type === 'mcq' ? 'mcq'
                        : question.type === 'reading' ? 'reading'
                        : question.type === 'listening' ? 'listening' : 'mcq',
                      optionIndex: parseInt(v, 10),
                    } as AnswerValue)}
                    className="contents"
                  >
                    <RadioGroupItem value={String(idx)} id={`opt-${question.id}-${idx}`} className="flex-shrink-0 mt-0.5" />
                  </RadioGroup>
                ) : (
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleMSQ(idx)}
                    className="flex-shrink-0 mt-0.5"
                  />
                )}
                <span
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold',
                    selected ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600',
                  )}
                >
                  {LETTERS[idx] ?? String(idx + 1)}
                </span>
                <span className="flex-1 text-sm leading-relaxed break-words text-stone-800">
                  {opt}
                </span>
                {selected && (
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (isNumeric) {
    const numVal = value && value.type === 'numerical' ? String(value.value) : '';
    return (
      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor={`num-${question.id}`}>Your answer {question.unit ? `(${question.unit})` : ''}</Label>
        <Input
          id={`num-${question.id}`}
          type="number"
          inputMode="decimal"
          step="any"
          placeholder="Enter a number"
          value={numVal}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') {
              onChange({ type: 'unanswered' });
            } else {
              const n = parseFloat(v);
              if (!Number.isNaN(n)) onChange({ type: 'numerical', value: n });
            }
          }}
        />
      </div>
    );
  }

  if (isSpeaking) {
    const txt = value && value.type === 'speaking' ? value.text : '';
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
          <Mic className="h-4 w-4 text-amber-700" />
          <span className="text-xs text-amber-900">
            Speaking response — record yourself, then paste your transcript below for AI evaluation.
          </span>
        </div>
        <Textarea
          rows={5}
          placeholder="Type or paste your spoken response here..."
          value={txt}
          onChange={(e) => onChange({ type: 'speaking', text: e.target.value })}
        />
        <p className="text-xs text-muted-foreground text-right">{txt.length} chars</p>
      </div>
    );
  }

  if (isDescriptive) {
    const txt =
      value && (value.type === 'descriptive' || value.type === 'writing') ? value.text : '';
    return (
      <div className="space-y-2">
        <Textarea
          rows={8}
          placeholder="Write your answer in detail. The AI will grade based on key concepts and structure."
          value={txt}
          onChange={(e) =>
            onChange({
              type: question.type === 'writing' ? 'writing' : 'descriptive',
              text: e.target.value,
            } as AnswerValue)
          }
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" /> Aim for 150-300 words
          </span>
          <span>{txt.length} chars · ~{Math.max(0, Math.round(txt.split(/\s+/).filter(Boolean).length))} words</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground border border-dashed border-stone-200 rounded-md p-3">
      This question type is not supported yet.
    </div>
  );
}
