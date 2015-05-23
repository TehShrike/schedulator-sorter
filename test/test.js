var test = require('tape')
var Sorter = require('../')

test("One person who's worked both jobs, and one person who hasn't worked any", function(t) {
	var sorter = new Sorter()

	sorter.priorWork({
		personId: 5,
		time: 1,
		job: 'a'
	})

	sorter.priorWork({
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
	var nextWeek = sorter.getNextSchedule(jobsToSchedule, poolOfWorkers)

	t.equal(nextWeek.a.personId, 5, 'personId 5 does job a')
	t.equal(nextWeek.a.name, 'Josh', 'Josh does job a')
	t.equal(nextWeek.b.personId, 6, 'personId 6 does job b')

	var weekAfterThat = sorter.getNextSchedule(jobsToSchedule, poolOfWorkers)

	t.equal(weekAfterThat.a.personId, 6, 'personId 6 does job a')
	t.equal(weekAfterThat.b.personId, 5, 'personId 5 does job b')


	t.end()
})

test("Nobody works the same job twice in a row", function(t) {
	var workerPool = [{ name: 'Josh', personId: 1},
		{ name: 'Caleb', personId: 2}]

	var sorter = new Sorter()

	var firstWeek = sorter.getNextSchedule(['a', 'b'], workerPool)
	var secondWeek = sorter.getNextSchedule(['a', 'b'], workerPool)

	t.notEqual(firstWeek.a.personId, firstWeek.b.personId, 'Different person worked each job the first week')
	t.notEqual(secondWeek.a.personId, secondWeek.b.personId, 'Different person worked each job the second week')
	t.notEqual(firstWeek.a.personId, secondWeek.a.personId, 'Different person worked job a each week')
	t.notEqual(firstWeek.b.personId, secondWeek.b.personId, 'Different person worked job b each week')
	t.end()
})

test("Example", function(t) {
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

	t.equal(firstWeek.a.name, 'Caleb')
	t.equal(firstWeek.b.name, 'Nathan')

	var secondWeek = sorter.getNextSchedule(['a', 'b'], workerPool)

	t.equal(secondWeek.a.name, 'Josh')
	t.equal(secondWeek.b.name, 'Caleb')

	t.end()
})
