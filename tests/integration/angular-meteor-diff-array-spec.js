describe('diffArray module', function() {
  beforeEach(angular.mock.module('diffArray'));

  describe('diffArray service', function() {
    var diffArray,
        deepCopyRemovals,
        deepCopyChanges,
        addedAtSpy,
        changedAtSpy;

    beforeEach(angular.mock.inject(function(_diffArray_, _deepCopyRemovals_, _deepCopyChanges_) {
      diffArray = _diffArray_;
      deepCopyRemovals = _deepCopyRemovals_;
      deepCopyChanges = _deepCopyChanges_;
    }));

    beforeEach(function(){
      addedAtSpy = jasmine.createSpy('addedAt');
      changedAtSpy = jasmine.createSpy('changedAt');
    });

    it('should check for nested objects on default', function() {
      var addedDoc = {_id: "c", b: 1};
      var oldCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {firstNested: "b"}, willBeRemoved: ":'("}
      ];
      var newCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {nestedInSecond: "a"}, third: "hello"},
        addedDoc
      ];

      diffArray(oldCollection, newCollection, {
        addedAt: addedAtSpy,
        changedAt: changedAtSpy,
      });

      expect(changedAtSpy).toHaveBeenCalledWith(
        'b',
        {_id: "b", "second.nestedInSecond": "a", "third": "hello"},
        {_id: "b", "second.firstNested": true, willBeRemoved: true},
        1,
        jasmine.any(Object));
    });

    it('should not check for nested objects when asking to ignore it', function() {
      var addedDoc = {_id: "c", b: 1};
      var oldCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {firstNested: "b"}, willBeRemoved: ":'("}
      ];
      var newCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {nestedInSecond: "a"}, third: "hello"},
        addedDoc
      ];

      diffArray(oldCollection, newCollection, {
        addedAt: addedAtSpy,
        changedAt: changedAtSpy
      }, true); // TRUE here means to ignore nested

      expect(changedAtSpy).toHaveBeenCalledWith(
        'b',
        {_id: "b", "third": "hello"},
        {_id: "b", willBeRemoved: true},
        1,
        jasmine.any(Object));
    });

    it('should notify addedAt and changedAt changes between two arrays', function() {
      var addedDoc = {_id: "c", b: 1};
      var oldCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {firstNested: "b"}, willBeRemoved: ":'("}
      ];
      var newCollection = [
        {_id: "a", identical: "property"},
        {_id: "b", first: 2, second: {nestedInSecond: "a"}, third: "hello"},
        addedDoc
      ];

      diffArray(oldCollection, newCollection, {
        addedAt: addedAtSpy,
        changedAt: changedAtSpy,
      });

      expect(addedAtSpy).toHaveBeenCalledWith(addedDoc._id, addedDoc, 2, jasmine.any(Object));
      expect(changedAtSpy).toHaveBeenCalledWith(
        'b',
        {_id: "b", "second.nestedInSecond": "a", "third": "hello"},
        {_id: "b", "second.firstNested": true, willBeRemoved: true},
        1,
        jasmine.any(Object));
    });

    it('should detect transition from null to empty nested object', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: null}];
      var newCollection = [{_id: "a", simple: 2, nested: {}}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: {}}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from empty nested object to null', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: {}}];
      var newCollection = [{_id: "a", simple: 2, nested: null}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: null}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from non-null to empty nested object', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: 1}];
      var newCollection = [{_id: "a", simple: 2, nested: {}}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: {}}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from empty nested object to non-null', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: {}}];
      var newCollection = [{_id: "a", simple: 2, nested: 1}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy}, true);
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: 1}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from null to empty array', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: null}];
      var newCollection = [{_id: "a", simple: 2, nested: []}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: []}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from empty array to null', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: []}];
      var newCollection = [{_id: "a", simple: 2, nested: null}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: null}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from non-null to empty array', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: 1}];
      var newCollection = [{_id: "a", simple: 2, nested: []}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: []}, undefined, 0, _.clone(oldCollection[0]));
    });

    it('should detect transition from empty array to non-null', function() {
      var oldCollection = [{_id: "a", simple: 1, nested: []}];
      var newCollection = [{_id: "a", simple: 2, nested: 1}];
      diffArray(oldCollection, newCollection, {changedAt: changedAtSpy});
      expect(changedAtSpy).toHaveBeenCalledWith(
        'a', {_id: "a", simple: 2, nested: 1}, undefined, 0, _.clone(oldCollection[0]));
    });

    describe('when comparing two arrays with two different dates', function() {
      it('should notify callback with changedAt', function() {
        var oldCollection = [{
          _id: "a", date: new Date(1111, 1, 1)
        }];
        var newCollection = [{
          _id: "a", date: new Date(2222, 2, 2)
        }];

        expect(function(){diffArray(oldCollection, newCollection, { changedAt: changedAtSpy })}).not.toThrow();

        expect(changedAtSpy).toHaveBeenCalledWith(
          'a',
          {_id: "a", date: new Date(2222, 2, 2)},
          undefined,
          0,
          jasmine.any(Object));
      });
    });

    describe('no exception on first compare and ignore $$hashkeys', function() {
      it('should notify callback with changedAt', function() {
        var oldCollection = [{
          _id: "a", date: new Date(1111, 1, 1), checked: true, $$hashKey: "object:4"
        },
        {
          _id: "b", date: new Date(2222, 2, 2), checked: true, $$hashKey: "object:6"
        },
        {
          _id: "c", date: new Date(2222, 2, 2), checked: true, $$hashKey: "object:8"
        }];
        var newCollection = [{
          _id: "a", date: new Date(1111, 1, 1), checked: true
        },
        {
          _id: "b", date: new Date(2222, 2, 2), checked: false
        },
        {
          _id: "c", date: new Date(2222, 2, 2), checked: true
        }];

        expect(function(){diffArray(oldCollection, newCollection, { changedAt: changedAtSpy })}).not.toThrow();

        expect(changedAtSpy).toHaveBeenCalledWith(
          'b',
          {checked: false, _id: "b"},
          undefined,
          1,
          jasmine.any(Object));
      });
    });

    describe('deepCopyRemovals', function() {
      it('should handle fields that are false-y correctly', function() {
        var oldItem = {_id: 1, field : 0, another : 3};
        var newItem = {_id: 1, field : 0};

        deepCopyRemovals(oldItem, newItem);

        expect(oldItem).toEqual(newItem);
      });

      it('should not remove fields with null value', function() {
        var oldItem = {_id: 1, field : 0, another : 3};
        var newItem = {_id: 1, field : 0, another: null};
        var oldItemBefore = angular.copy(oldItem);

        deepCopyRemovals(oldItem, newItem);

        expect(oldItem).toEqual(oldItemBefore);
      });
    });

    describe('deepCopyChanges', function() {
      it('should copy null values', function() {
        var oldItem = {_id: 1, field : 0, another : 3};
        var newItem = {_id: 1, field : 0, another: null};

        deepCopyChanges(oldItem, newItem);

        expect(oldItem).toEqual(newItem);
      });
      it('should copy new values', function() {
        var oldItem = {

        };
        var newItem = {
          "copies": {
            "images": {
              "name": "somthing.png",
              "type": "image/png",
              "size": 4508257
            }
          }
        };

        deepCopyChanges(oldItem, newItem);

        expect(oldItem).toEqual(newItem);
      });
    });

  });
});
