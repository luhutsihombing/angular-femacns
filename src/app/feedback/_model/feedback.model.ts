export interface FeedbackSearchTerm {
    templateName: string;
    templateCategory: string;
}

export interface FeedbackSearchItem {
    id: string;
    lastUpdateDate: number;
    lastUpdateBy: string;
    templateName: string;
    enableEdit: boolean;
}

export interface FeedbackSave {
    categories: Array<{
        categoryId: string;
        questionCategory: string;
        questions: Array<{
            allowFillIn: boolean;
            choices: Array<string>;
            dateFormat: string;
            defaultValue: string;
            image: string;
            maxNumCharacters: number;
            numOfLinesEditing: number;
            numOfRange: number;
            question: string;
            questionId: string;
            ratingScale: string;
            required: boolean;
            typeOfAnswerValue: string;
        }>;
    }>;
    feedbackId: string;
    description: string;
    needCalculation: boolean;
    templateName: string;
}

export interface Feedback {
    feedbackId: string;
    templateName: string;
    description: string;
    needCalculation: boolean;
    categories: Array<{
        categoryId: string;
        questionCategory: string;
        questions: Array<{
            questionId: string;
            question: string;
            required: boolean;
            typeOfAnswerValue: string;
            typeOfAnswerLabel: string;
            allowFillIn: boolean;
            choices: Array<string>;
            maxNumCharacters: number;
            numOfRange: number;
            numOfLinesEditing: number;
        }>;
    }>;
}

export interface FeedbackSequence {
    feedbackId: string;
    templateName: string;
    enableEdit: boolean;
    categories: Array<{
        questionCategoryId: string;
        questionCategory: string;
        sequenceCategoryNum: number;
        questions: Array<{
            questionId: string;
            question: string;
            sequenceNum: number;
        }>;
    }>;
}

export interface FeedbackEventSuggestion {
    itemId: string;
    itemName: string;
    itemStartDate: Date;
    itemType: string;
}

export class FeedbackTemplateSuggestion {
    id: string;
    templateName: string;
}
