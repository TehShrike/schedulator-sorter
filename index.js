function canThisPersonWorkThisJob(personAggregateHistory, jobInQuestion) {
	if (typeof personAggregateHistory === 'undefined') {
		return true
	} else if (typeof personAggregateHistory.jobs[jobInQuestion] === 'undefined') {
		return true
	}

	var oldestJobTheyveWorked = Object.keys(personAggregateHistory.jobs).map(function(jobName) {
		return {
			jobName: jobName,
			time: personAggregateHistory.jobs[jobName]
		}
	}).reduce(function(oldestJobSoFar, thisJob) {
		return oldestJobSoFar.time < thisJob.time ? oldestJobSoFar : thisJob
	})

	return oldestJobTheyveWorked.jobName === jobInQuestion
}

function sortWorkersByHowLongAgoTheyWorked(aggregateHistory, a, b) {
	var aAggregate = aggregateHistory[a.personId]
	var bAggregate = aggregateHistory[b.personId]

	if (typeof aAggregate === 'undefined' && typeof bAggregate === 'undefined') {
		return 0
	} else if (typeof aAggregate === 'undefined') {
		return -1
	} else if (typeof bAggregate === 'undefined') {
		return 1
	}

	return aAggregate.lastWork - bAggregate.lastWork
}

module.exports = function Sorter() {
	var aggregateHistory = {}
	var mostRecentTime = 0

	var sortWorkers = sortWorkersByHowLongAgoTheyWorked.bind(null, aggregateHistory)

	// {
	// 	personId: 5,
	// 	time: 1,
	// 	job: 'a'
	// }
	function thingHappened(thing) {
		if (typeof aggregateHistory[thing.personId] === 'undefined') {
			aggregateHistory[thing.personId] = {
				lastWork: -1,
				jobs: {}
			}
		}

		var aggregate = aggregateHistory[thing.personId]

		aggregate.lastWork = Math.max(aggregate.lastWork, thing.time)

		var jobId = thing.job
		aggregate.jobs[jobId] = Math.max(aggregate.jobs[jobId] || 0, thing.time)

		mostRecentTime = Math.max(mostRecentTime, thing.time)
	}

	function nextSchedule(jobsToSchedule, poolOfWorkers) {
		var nextScheduleTime = mostRecentTime + 1
		var peopleWhoCanWorkJobsByJobName = {}
		var peopleIdsWeveScheduledAlready = []
		var nextScheduleWorkers = {}

		jobsToSchedule.forEach(function(jobName) {
			peopleWhoCanWorkJobsByJobName[jobName] = poolOfWorkers.filter(function(worker) {
				var personsAggregateHistory = aggregateHistory[worker.personId]
				return canThisPersonWorkThisJob(personsAggregateHistory, jobName)
			}).sort(sortWorkers)
		})

		var sortedJobs = jobsToSchedule.sort(function(a, b) {
			return peopleWhoCanWorkJobsByJobName[a].length - peopleWhoCanWorkJobsByJobName[b].length
		})

		sortedJobs.forEach(function(jobName) {
			var candidates = peopleWhoCanWorkJobsByJobName[jobName]
			var potentialCandidate
			var chosenCandidate = null
			while (!chosenCandidate) {
				potentialCandidate = candidates.shift()
				var hasAlreadyBeenAssigned = peopleIdsWeveScheduledAlready.indexOf(potentialCandidate.personId) !== -1
				if (!hasAlreadyBeenAssigned) {
					chosenCandidate = potentialCandidate
				}
			}
			peopleIdsWeveScheduledAlready.push(chosenCandidate.personId)
			nextScheduleWorkers[jobName] = chosenCandidate

			var nextWorkThing = {
				personId: chosenCandidate.personId,
				time: nextScheduleTime,
				job: jobName
			}
			thingHappened(nextWorkThing)
		})

		return nextScheduleWorkers
	}

	return {
		thingHappened: thingHappened,
		nextSchedule: nextSchedule
	}
}
