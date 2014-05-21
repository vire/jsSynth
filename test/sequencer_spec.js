describe('Sequencer', function() {
  it('class should exists', function() {
    expect(Sequencer).toBeDefined();
    expect(Sequencer.prototype.constructor.name).toBe('Sequencer')
    expect(typeof Sequencer).toBe('function');
  });

  describe('should have a ', function() {
    var seq = null;

    beforeEach(function() {
      seq = new Sequencer('mySequencer');
      spyOn(seq, 'start').and.callThrough();
      spyOn(seq, 'stop').and.callThrough();      

    });
    afterEach(function() {
      seq = null;
    })

    it('name property set to `mySequencer`', function() {
      expect(seq.name).not.toBe('');
      expect(seq.name).toBe('mySequencer')
    });

    it('start method', function() {
      seq.start();
      expect(seq.start).toHaveBeenCalled();
      expect(seq.isPlaying).toBeTruthy();
    });

    it('stop method', function() {
      seq.stop();
      expect(seq.stop).toHaveBeenCalled();
      expect(seq.isPlaying).toBeFalsy();
    });

  })
})