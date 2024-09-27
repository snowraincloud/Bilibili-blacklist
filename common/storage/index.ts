import { storage } from 'wxt/storage';
import { GeneralFilterSettings, Blacklist, ReportItem, AppSettings, FilterString } from '@/common/types'
import { homeFeedFilter } from '@/filter/home-feed';
import { homeComicsFilter } from '@/filter/home-comics';
import { homeCourseFilter } from '@/filter/home-course';
import { homeTimelineFilter } from '@/filter/home-timeline';
import { homeVarietyFilter } from '@/filter/home-variety';
import { homeMovieFilter } from '@/filter/home-movie';
import { homeMoreRecFilter } from '@/filter/home-more-rec';

export const appSettingsStorage = storage.defineItem<AppSettings>(
    'local:appSettings',
    {
        version: 1,
        defaultValue: {
            start: false,
            debug: false,
            report: true,
            reportLimit: 1000,
        },
    },
);

export const generalFilterSettingsStorage = storage.defineItem<GeneralFilterSettings>(
    'local:generalFilterSettings',
    {
        version: 1,
        defaultValue: {
            showBlockMask: true,
            showFollowed: true,
        },
    },
);

export const blacklistStorage = storage.defineItem<Blacklist>(
    'local:blacklist',
    {
        version: 1,
        defaultValue: {
            uidList: ['589708238'],
            unameList: [],
            unameRegexList: [],
            titleRegexList: ['/.*大型纪录片.*/', '/.*拒绝废话.*/'],
        },
    },
);

export const reportStorage = storage.defineItem<ReportItem[]>(
    'local:report',
    {
        version: 1,
        defaultValue: [],
    },
);

export const filterListStorage = storage.defineItem<Array<FilterString>>(
    'local:filterList',
    {
        version: 1,
        defaultValue: [homeFeedFilter, homeComicsFilter, homeCourseFilter, homeMoreRecFilter, homeMovieFilter, homeTimelineFilter, homeVarietyFilter],
    },
);

