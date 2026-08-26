import { CalendarIcon, CheckIcon, PencilIcon } from './icons';

export type StepIcon = 'pencil' | 'calendar' | 'check';
export type StepStatus = 'done' | 'current' | 'future';

export interface StepperStep {
  /** Already-translated label (Inscription / Session / Validation). */
  label: string;
  icon: StepIcon;
  status: StepStatus;
}

interface StepperProps {
  steps: StepperStep[];
  /** Fixed total width in px. */
  width?: number;
}

function StepGlyph({ icon, status }: { icon: StepIcon; status: StepStatus }) {
  // A done step always shows a white check; otherwise the step's own icon.
  if (status === 'done') return <CheckIcon size={13} color="#ffffff" strokeWidth={2.2} />;
  const color = status === 'current' ? '#ffffff' : '#b3b7be';
  if (icon === 'pencil') return <PencilIcon size={13} color={color} strokeWidth={1.8} />;
  if (icon === 'calendar') return <CalendarIcon size={13} color={color} strokeWidth={1.8} />;
  return <CheckIcon size={13} color={color} strokeWidth={2} />;
}

/**
 * Fixed-width 3-step progress stepper: 28px circles linked by 2px lines.
 * done = solid green + white check, current = solid blue + white icon,
 * future = #d5d7d1 outline + #b3b7be icon. Connectors turn blue up to the
 * current step.
 */
export function Stepper({ steps, width = 224 }: StepperProps) {
  return (
    <div className="flex shrink-0 items-start" style={{ width }}>
      {steps.map((step, index) => {
        const circle =
          step.status === 'done'
            ? 'bg-success'
            : step.status === 'current'
              ? 'bg-accent'
              : 'border-[1.5px] border-stepper-future';
        const label =
          step.status === 'done'
            ? 'font-medium text-success'
            : step.status === 'current'
              ? 'font-semibold text-accent'
              : 'font-medium text-ink-disabled';
        const connectorActive = step.status === 'current' || step.status === 'done';

        return (
          <StepperFragment key={step.label + index}>
            {index > 0 && (
              <div
                className={`mt-[13px] h-0.5 grow ${connectorActive ? 'bg-accent' : 'bg-stepper-line'}`}
              />
            )}
            <div className="flex w-16 flex-col items-center gap-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${circle}`}>
                <StepGlyph icon={step.icon} status={step.status} />
              </div>
              <span className={`text-[10px] ${label}`}>{step.label}</span>
            </div>
          </StepperFragment>
        );
      })}
    </div>
  );
}

function StepperFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
