// noinspection SpellCheckingInspection
class Course {
    constructor() {
        this.courseRooms = {
            MTH1WYa: 210,
            MTH1WYb: 212,
            MTH1WYc: 210,
            MTH1WYd: 212,
            ENG1DYa: 2002,
            ENG1DYb: 2003,
            SNC1WYd: 216,
            CGC1DYa: 1007,
            CGC1DYb: 1007,
            HRE1O1a: 1105,
            HRE1O1b: 1106,
            HRE1O1c: 1106,
            HRE1O1d: 1122,
            HRE1O1e: 1124,
            HRE1O1f: 1122,
            HRE1O1g: 1120,
            HRE1O2a: 1120,
            HRE1O2b: 1120,
            PPL1OMa: 'GYBC',
            PPL1OMb: 'GYBC',
            PPL1OMc: 'GYBC',
            PPL1OMe: 'GYCC',
            PPL1OFa: 'GYBC',
            PPL1OFb: 'GYAC',
            PPL1OFd: 'GYBC',
            AVI1O1a: 102,
            AVI1O1b: 101,
            AMU1O1a: 112,
            AMU1O1b: 112,
            FSF1D1a: 208,
            FSF1D1b: 203,
            FSF1D1c: 205,
            FSF1D1d: 205,
            FSF1D1e: 1119,
            FSF1D1f: 203,
            FSF1D1g: 203,
            FSF1D1k: 2002,
            TIJ1O1a: 103,
            TIJ1O1b: 103,
            BTT1O1a: 207,
            BTT1O1b: 207
        }
        this.coursePeriods = {
            MTH1WYa: 4,
            MTH1WYb: 3,
            MTH1WYc: 1,
            MTH1WYd: 4,
            ENG1DYa: 3,
            ENG1DYb: 1,
            SNC1WYd: 3,
            CGC1DYa: 3,
            CGC1DYb: 1,
            HRE1O1a: 2,
            HRE1O1b: 4,
            HRE1O1c: 3,
            HRE1O1d: 1,
            HRE1O1e: 2,
            HRE1O1f: 4,
            HRE1O1g: 3,
            HRE1O2a: 2,
            HRE1O2b: 2,
            PPL1OMa: 4,
            PPL1OMb: 3,
            PPL1OMc: 1,
            PPL1OMe: 3,
            PPL1OFa: 2,
            PPL1OFb: 1,
            PPL1OFd: 1,
            AVI1O1a: 2,
            AVI1O1b: 4,
            AMU1O1a: 2,
            AMU1O1b: 2,
            FSF1D1a: 2,
            FSF1D1b: 1,
            FSF1D1c: 4,
            FSF1D1d: 3,
            FSF1D1e: 1,
            FSF1D1f: 2,
            FSF1D1g: 4,
            FSF1D1k: 2,
            TIJ1O1a: 2,
            TIJ1O1b: 3,
            BTT1O1a: 2,
            BTT1O1b: 1
        }
        this.subjectCodes = {
            MTH: 'ap',
            ENG: 'ap',
            SNC: 'ap',
            CGC: 'ap',
            HRE1O1: 'religion',
            HRE1O2: 'religion',
            PPLM: 'art_and_gym',
            PPLF: 'art_and_gym',
            AVI: 'art_and_gym',
            AMU: 'art_and_gym',
            FSF: 'french',
            TIJ: 'elective',
            BTT:'elective'

        }
        this.codeId = {
            MTH: 'Math',
            ENG: 'English',
            SNC: 'Science',
            CGC: 'History/Geography',
            HRE1O1: 'Religion',
            HRE1O2: 'Music/Religion',
            PPLM: 'Male Gym',
            PPLF: 'Female Gym',
            AVI: 'Visual Arts',
            AMU: 'Instrumental Music',
            FSF: 'French',
            TIJ: 'Technology',
            BTT:'Business'
        }
        this.codes = {
            MTH: [],
            ENG: [],
            SNC: [],
            CGC: [],
            HRE1O1: [],
            HRE1O2: [],
            PPLM: [],
            PPLF: [],
            AVI: [],
            AMU: [],
            FSF: [],
            TIJ: [],
            BTT: [],
        }
        this.courses = {
            ap: [
                {
                    label: 'MTH1WYa',
                    description: 'Room 210 / Period 4',
                    value: 'MTH1WYa',
                },
                {
                    label: 'MTH1WYb',
                    description: 'Room 212 / Period 3',
                    value: 'MTH1WYb',
                },
                {
                    label: 'MTH1WYc',
                    description: 'Room 210 / Period 1',
                    value: 'MTH1WYc',
                },
                {
                    label: 'MTH1WYd',
                    description: 'Room 212 / Period 4',
                    value: 'MTH1WYd',
                },
                {
                    label: 'ENG1DYa',
                    description: 'Room 2002 / Period 3',
                    value: 'ENG1DYa',
                },
                {
                    label: 'ENG1DYb',
                    description: 'Room 2003 / Period 1',
                    value: 'ENG1DYb',
                },
                {
                    label: 'SNC1WYd',
                    description: 'Room 216 / Period 3',
                    value: 'SNC1WYd',
                },
                {
                    label: 'CGC1DYa',
                    description: 'Room 1007 / Period 3',
                    value: 'CGC1DYa',
                },
                {
                    label: 'CGC1DYb',
                    description: 'Room 1007 / Period 1',
                    value: 'CGC1DYb',
                }
            ],
            religion: [
                {
                    label: 'HRE1O1a',
                    description: 'Room 1105 / Period 2',
                    value: 'HRE1O1a',
                },
                {
                    label: 'HRE1O1b',
                    description: 'Room 1106 / Period 4',
                    value: 'HRE1O1b',
                },
                {
                    label: 'HRE1O1c',
                    description: 'Room 1106 / Period 3',
                    value: 'HRE1O1c',
                },
                {
                    label: 'HRE1O1d',
                    description: 'Room 1122 / Period 1',
                    value: 'HRE1O1d',
                },
                {
                    label: 'HRE1O1e',
                    description: 'Room 1124 / Period 2',
                    value: 'HRE1O1e',
                },
                {
                    label: 'HRE1O1f',
                    description: 'Room 1122 / Period 4',
                    value: 'HRE1O1f',
                },
                {
                    label: 'HRE1O1g',
                    description: 'Room 1120 / Period 3',
                    value: 'HRE1O1g',
                },
                {
                    label: 'HRE1O2a',
                    description: 'Room 1120 / Period 2 / Day 2',
                    value: 'HRE1O2a',
                },
                {
                    label: 'HRE1O2b',
                    description: 'Room 1120 / Period 2 / Day 1',
                    value: 'HRE1O2b',
                },
            ],
            art_and_gym: [
                {
                    label: 'PPL1OMa',
                    description: 'GYBC / Period 4',
                    value: 'PPL1OMa',
                },
                {
                    label: 'PPL1OMb',
                    description: 'GYBC / Period 3',
                    value: 'PPL1OMb',
                },
                {
                    label: 'PPL1OMc',
                    description: 'GYBC / Period 1',
                    value: 'PPL1OMc',
                },
                {
                    label: 'PPL1OMe',
                    description: 'GYCC / Period 3',
                    value: 'PPL1OMe',
                },
                {
                    label: 'PPL1OFa',
                    description: 'GYBC / Period 2',
                    value: 'PPL1OFa',
                },
                {
                    label: 'PPL1OFb',
                    description: 'GYAC / Period 1',
                    value: 'PPL1OFb',
                },
                {
                    label: 'PPL1OFd',
                    description: 'GYBC / Period 1',
                    value: 'PPL1OFd',
                },
                {
                    label: 'AVI1O1a',
                    description: 'Room 102 / Period 2',
                    value: 'AVI1O1a',
                },
                {
                    label: 'AVI1O1b',
                    description: 'Room 101 / Period 4',
                    value: 'AVI1O1b',
                },
                {
                    label: 'AMU1O1a',
                    description: 'Room 112 / Period 2 / Day 1',
                    value: 'AMU1O1a',
                },
                {
                    label: 'AMU1O1b',
                    description: 'Room 112 / Period 2 / Day 2',
                    value: 'AMU1O1b',
                },
            ],
            french: [
                {
                    label: 'FSF1D1a',
                    description: 'Room 208 / Period 2',
                    value: 'FSF1D1a',
                },
                {
                    label: 'FSF1D1b',
                    description: 'Room 203 / Period 1',
                    value: 'FSF1D1b',
                },
                {
                    label: 'FSF1D1c',
                    description: 'Room 205 / Period 4',
                    value: 'FSF1D1c',
                },
                {
                    label: 'FSF1D1d',
                    description: 'Room 205 / Period 3',
                    value: 'FSF1D1d',
                },
                {
                    label: 'FSF1D1e',
                    description: 'Room 1119 / Period 1',
                    value: 'FSF1D1e',
                },
                {
                    label: 'FSF1D1f',
                    description: 'Room 203 / Period 2',
                    value: 'FSF1D1f',
                },
                {
                    label: 'FSF1D1g',
                    description: 'Room 203 / Period 4',
                    value: 'FSF1D1g',
                },
                {
                    label: 'FSF1D1k',
                    description: 'Room 2002 / Period 2',
                    value: 'FSF1D1k',
                },
            ],
            elective: [
                {
                    label: 'TIJ1O1a',
                    description: 'Room 103 / Period 2',
                    value: 'TIJ1O1a',
                },
                {
                    label: 'TIJ1O1b',
                    description: 'Room 103 / Period 3',
                    value: 'TIJ1O1b',
                },
                {
                    label: 'BTT1O1a',
                    description: 'Room 207 / Period 2',
                    value: 'BTT1O1a',
                },
                {
                    label: 'BTT1O1b',
                    description: 'Room 207 / Period 1',
                    value: 'BTT1O1b',
                },
            ]
        }
    }


    getCodes() {
        return this.codes
    }

    /**
     * returns all courses
     * @returns {[ Object ]}
     */
    getCourses()  {
        return this.courses
    }

    /**
     * return courses based on course identifier
     * @returns {Object}
     * @param name
     */
    getCoursesByName(name) {
        return this.getCourses()[name]
    }
}

module.exports = { Course };
