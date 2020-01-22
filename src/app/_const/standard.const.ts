import { LookupDetail } from '../lookup/_model/lookup.model';

export const STANDARD_LOOKUP_SELECTION = [
    {
        ...({} as LookupDetail),
        id: '',
        meaning: '—Please Select—',
        detailCode: '—Please Select—'
    }
];

export const STANDARD_NON_STRING_SELECTION = [{ value: null, label: '—Please Select—' }];

export const STANDARD_STRING_SELECTION = [{ value: '' , label: '—Please Select—' }];

export const STANDARD_MONTHS_SELECTION = [
    {
        value: 'Jan',
        label: 'Jan',
    },
    {
        value: 'Feb',
        label: 'Feb',
    },
    {
        value: 'Mar',
        label: 'Mar',
    },
    {
        value: 'Apr',
        label: 'Apr',
    },
    {
        value: 'May',
        label: 'May',
    },
    {
        value: 'Jun',
        label: 'Jun',
    },
    {
        value: 'Jul',
        label: 'Jul',
    },
    {
        value: 'Aug',
        label: 'Aug',
    },
    {
        value: 'Sep',
        label: 'Sep',
    },
    {
        value: 'Oct',
        label: 'Oct',
    },
    {
        value: 'Nov',
        label: 'Nov',
    },
    {
        value: 'Dec',
        label: 'Dec',
    },
];


export const STANDARD_MONTHS_NUMBER_SELECTION = [
    {
        value: '1',
        label: 'Jan',
    },
    {
        value: '2',
        label: 'Feb',
    },
    {
        value: '3',
        label: 'Mar',
    },
    {
        value: '4',
        label: 'Apr',
    },
    {
        value: '5',
        label: 'May',
    },
    {
        value: '6',
        label: 'Jun',
    },
    {
        value: '7',
        label: 'Jul',
    },
    {
        value: '8',
        label: 'Aug',
    },
    {
        value: '9',
        label: 'Sep',
    },
    {
        value: '10',
        label: 'Oct',
    },
    {
        value: '11',
        label: 'Nov',
    },
    {
        value: '12',
        label: 'Dec',
    },
];
