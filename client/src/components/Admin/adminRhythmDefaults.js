/** Stable section + row ids for React keys and localStorage merges. */

/** Visual grouping on the admin page (weekly vs monthly vs reference). */
export const RHYTHM_BAND_LABELS = {
    weekly: 'Weekly rhythm (day-by-day)',
    monthly: 'Monthly themes & phases',
    reference: 'Reference & output',
};

/** Infer band from persisted `section.band` or from stable section id. */
export function inferSectionBand(section) {
    const b = section?.band;
    if (b === 'weekly' || b === 'monthly' || b === 'reference') return b;
    const id = String(section?.id || '');
    if (id.startsWith('month-')) return 'monthly';
    if (id === 'output-tracker' || id === 'simple-flow') return 'reference';
    return 'weekly';
}

export function rid() {
    return `r_${Math.random().toString(36).slice(2, 11)}`;
}

function row(cells) {
    return { id: rid(), cells: [...cells] };
}

function sec(id, title, columns, rows, note = '') {
    return {
        id,
        title,
        note,
        columns: [...columns],
        rows: rows.map((cells) => row(cells)),
    };
}

export function createDefaultRhythmDocument() {
    return {
        version: 1,
        sections: [
            sec('baseline', 'Daily baseline (every day)', ['Activity', 'Time', 'Notes'], [
                ['Walk', '60 min', 'Morning preferred'],
                ['Yoga', '30 min', 'Before work block'],
                ['Reading', '30 min', 'Can reduce to 15 min if needed'],
            ]),
            sec(
                'week-a-mon',
                'Week A — Monday',
                ['Time', 'Task', 'Category'],
                [
                    ['8:20–8:40', 'Yoga', 'Practice'],
                    ['3:30–4:00', 'Learning (SEO / UX)', 'Course'],
                    ['4:00–4:30', 'Admin', 'Admin'],
                ]
            ),
            sec(
                'week-a-tue',
                'Week A — Tuesday (SEO day)',
                ['Time', 'Task', 'Category'],
                [
                    ['8:30–9:30', 'Walk', 'Baseline'],
                    ['9:30–10:00', 'Yoga', 'Practice'],
                    ['10:00–10:30', 'Keyword + outline', 'SEO'],
                    ['10:30–12:00', 'Write blog', 'SEO'],
                    ['12:00–12:30', 'Break', '—'],
                    ['12:30–1:30', 'Finish writing', 'SEO'],
                    ['1:30–2:15', 'Edit + optimize', 'SEO'],
                    ['2:15–3:00', 'Buffer', 'SEO'],
                ]
            ),
            sec(
                'week-a-wed',
                'Week A — Wednesday (build day)',
                ['Time', 'Task', 'Category'],
                [
                    ['10:00–11:00', 'Walk', 'Baseline'],
                    ['11:00–11:30', 'Yoga', 'Practice'],
                    ['11:30–3:30', 'Omvira OR Website', 'Build'],
                    ['3:30–4:00', 'Admin (quick)', 'Admin'],
                    ['4:00–4:30', 'Continue build', 'Build'],
                ]
            ),
            sec(
                'week-a-thu',
                'Week A — Thursday (yoga therapy day)',
                ['Time', 'Task', 'Category'],
                [
                    ['12:30–1:00', 'Yoga', 'Practice'],
                    ['1:00–2:30', 'Anatomy / physiology', 'Study'],
                    ['2:30–3:30', 'Class planning', 'Teaching'],
                    ['3:30–4:30', 'Content (video/post)', 'Marketing'],
                ]
            ),
            sec(
                'week-a-fri-short',
                'Week A — Friday (short)',
                ['Time', 'Task', 'Category'],
                [
                    ['2:00–2:20', 'Yoga', 'Practice'],
                    ['2:20–3:00', 'Publish blog', 'SEO'],
                ]
            ),
            sec(
                'week-a-fri-long',
                'Week A — Friday (long)',
                ['Time', 'Task', 'Category'],
                [
                    ['8:00–9:00', 'Walk', 'Baseline'],
                    ['9:00–9:30', 'Yoga', 'Practice'],
                    ['9:30–11:00', 'Finish blog', 'SEO'],
                    ['11:00–12:00', 'Publish', 'SEO'],
                    ['12:00–1:00', 'Admin (deep)', 'Admin'],
                    ['1:00–2:00', 'Outreach', 'Business'],
                    ['2:00–3:00', 'Website improvement', 'Build'],
                ]
            ),
            {
                id: 'week-b-intro',
                title: 'Week B — differences',
                note: 'Friday (long) = main execution — same table as Week A long Friday above.',
                columns: ['Time', 'Task', 'Category'],
                rows: [],
            },
            sec(
                'week-b-tue',
                'Week B — Tuesday (split)',
                ['Time', 'Task', 'Category'],
                [
                    ['8:30–9:30', 'Walk', 'Baseline'],
                    ['9:30–10:00', 'Yoga', 'Practice'],
                    ['10:00–10:30', 'Outline', 'SEO'],
                    ['2:00–3:30', 'Writing', 'SEO'],
                ]
            ),
            sec(
                'admin-weekly',
                'Admin schedule (weekly total = 2 hours)',
                ['Day', 'Time', 'Type'],
                [
                    ['Monday', '30 min', 'Light'],
                    ['Wednesday', '30 min', 'Quick'],
                    ['Friday', '60 min', 'Deep'],
                ]
            ),
            sec(
                'month-1-2',
                'Month 1–2 (April–May)',
                ['Area', 'Focus'],
                [
                    ['Goal', 'SEO visibility'],
                    ['Monday Course', 'Search Engine Optimization Specialization'],
                    ['Output', '6–8 blogs, 4–6 content pieces'],
                ]
            ),
            sec(
                'month-3',
                'Month 3 (June)',
                ['Area', 'Focus'],
                [
                    ['Goal', 'Website conversion'],
                    ['Monday Course', 'Google UX Design Certificate'],
                    ['Add', 'Testimonials, clear offers'],
                ]
            ),
            sec(
                'month-4',
                'Month 4 (July)',
                ['Area', 'Focus'],
                [
                    ['Goal', 'Specialization'],
                    ['Start', 'Pain Reprocessing Therapy Training'],
                    ['Content', 'Pain + nervous system'],
                ]
            ),
            sec(
                'month-5',
                'Month 5 (August)',
                ['Area', 'Focus'],
                [
                    ['Goal', 'Clients'],
                    ['Add', 'Outreach, offers'],
                ]
            ),
            sec(
                'month-6',
                'Month 6 (September)',
                ['Area', 'Focus'],
                [
                    ['Goal', 'Scale + job readiness'],
                    ['Add', 'Google Digital Marketing & E-commerce Professional Certificate'],
                    ['Change', 'Reduce blogs to 2/month'],
                ]
            ),
            sec(
                'output-tracker',
                'Weekly output tracker',
                ['Output', 'Target'],
                [
                    ['Blog posts', '1'],
                    ['Content (video/post)', '1'],
                    ['Class plan', '1'],
                    ['Build improvement', '1'],
                    ['Yoga sessions', '5+'],
                ]
            ),
            sec(
                'simple-flow',
                'Simple weekly flow (reference)',
                ['Day', 'Focus'],
                [
                    ['Monday', 'Learn + admin'],
                    ['Tuesday', 'SEO writing'],
                    ['Wednesday', 'Build'],
                    ['Thursday', 'Yoga therapy + teaching'],
                    ['Friday', 'Publish + admin + clients'],
                ]
            ),
        ],
    };
}
