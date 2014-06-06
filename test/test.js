var test = require('tap').test
var Sorter = require('../')

test("One person who's worked both jobs, and one person who hasn't worked any", function(t) {
	var sorter = new Sorter()

	sorter.thingHappened({
		personId: 5,
		time: 1,
		job: 'a'
	})

	sorter.thingHappened({
		personId: 5,
		time: 4,
		job: 'b'
	})

	var jobsToSchedule = ['a', 'b']
	var poolOfWorkers = [{
		personId: 5,
		name: 'Josh'
	}, {
		personId: 6,
		name: 'Caleb'
	}]
	var nextWeek = sorter.nextSchedule(jobsToSchedule, poolOfWorkers)

	t.equal(nextWeek.a.personId, 5, 'personId 5 does job a')
	t.equal(nextWeek.a.name, 'Josh', 'Josh does job a')
	t.equal(nextWeek.b.personId, 6, 'personId 6 does job b')

	var weekAfterThat = sorter.nextSchedule(jobsToSchedule, poolOfWorkers)

	t.equal(weekAfterThat.a.personId, 6, 'personId 6 does job a')
	t.equal(weekAfterThat.b.personId, 5, 'personId 5 does job b')


	t.end()
})
