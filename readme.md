[![Build Status](https://travis-ci.org/TehShrike/schedulator-sorter.svg)](https://travis-ci.org/TehShrike/schedulator-sorter)

For a given pool of workers, and a given list of jobs, find out who should work those jobs in the next time period.

Assigns work using these rules
=====

1. Workers should only work whatever job they haven't worked for the longest amount of time (or a job they haven't worked yet).
2. Whichever workers have not worked *any* job for the longest amount of time should be used to work these jobs, as long as rule 1 is met

API
=====

Constructor
-----

Takes no arguments.  Maintains an internal list of work history, to be used when determining a week's schedule.

	var Sorter = require('schedulator-sorter')
	var sorter = new Sorter()

priorWork(work)
-----

Takes a single argument: an object with parameters `personId`, `time`, and `job` - a person identifier, time identifier, and job identifier.

`personId` should match the `personId` property in the pool of workers passed to `getNextSchedule`, and `job` should match the value in the jobsToSchedule passed to the same function.

	sorter.priorWork({
		personId: [number/string],
		time: [number],
		job: [number/string]
	})

`time` must be a number.  It can be a unix timestamp, a year/week number, whatever, but all the jobs that happened at X time should have the same number, and that number should be greater than all the jobs that happened at previous time Y.

getNextSchedule(jobs, workers)
-----

Takes an array of jobs to schedule, and an array of objects representing workers who can do those jobs.

Returns an object whose parameters are job ids linking to the person to do that job.

`jobs` should be an array of primitive identifiers that match up to the identifiers passed to priorWork.  `workers` should be an array of objects that have a personId property.  Any other properties are optional, and will appear in the final schedule object.

	var workerPool = [{ name: 'Josh', personId: 1},
		{ name: 'Caleb', personId: 2},
		{ name: 'Nathan', personId: 3}]

	var sorter = new Sorter()

	sorter.priorWork({
		personId: 1,
		time: 1,
		job: 'b'
	})

	sorter.priorWork({
		personId: 3,
		time: 1,
		job: 'a'
	})

	var firstWeek = sorter.getNextSchedule(['a', 'b'], workerPool)
	console.log(firstWeek)
	// => { a: { time: 2, job: 'a', name: 'Caleb', personId: 2 }, b: { time: 2, job: 'b', name: 'Nathan', personId: 3 } }

	var secondWeek = sorter.getNextSchedule(['a', 'b'], workerPool)
	console.log(secondWeek)
	// => { a: { time: 3, job: 'a', name: 'Josh', personId: 1 }, b: { time: 3, job: 'b', name: 'Caleb', personId: 2 } }

