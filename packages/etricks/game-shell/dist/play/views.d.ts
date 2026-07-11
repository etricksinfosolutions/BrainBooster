import { type ReactNode } from "react";
import type { PreparedChoice, PreparedClassification } from "@etricks/activity-engine";
export declare function ChoiceView(props: {
    prepared: PreparedChoice;
    answered: boolean;
    chosenIndex?: number;
    onChoose: (i: number) => void;
}): ReactNode;
export declare function TrueFalseView(props: {
    prepared: {
        statement: string;
        answer: boolean;
    };
    answered: boolean;
    chosenValue?: boolean;
    onAnswer: (v: boolean) => void;
}): ReactNode;
export declare function ClassificationView(props: {
    prepared: PreparedClassification;
    answered: boolean;
    onSubmit: (assignments: number[]) => void;
}): ReactNode;
export declare function PlaceholderView(props: {
    type: string;
    onSkip: () => void;
}): ReactNode;
//# sourceMappingURL=views.d.ts.map