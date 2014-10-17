describe("DSL reader buildGraph()", function () {

    var data = [
        {"cycleTime": 10, "effort": 1.0000, "name": "Report", "team": "Exploited", "project": "TP3"},
        {"cycleTime": 22, "effort": 0.0000, "name": "Follow", "team": "Alaska", "project": "TP2"},
        {"cycleTime": 95, "effort": 2.0000, "name": "Errors", "team": "Exploited", "project": "TP2"}
    ];

    var checkFacetCells = function($matrix, facet) {
        $matrix.iterate(function(r, c, cell) {
            var rect = cell[0];
            expect(rect.type).to.equal('COORDS.RECT');
            expect(rect.x.scaleDim).to.deep.equal('cycleTime');
            expect(rect.y.scaleDim).to.deep.equal('effort');
            expect(rect.$matrix.sizeR()).to.equal(1);
            expect(rect.$matrix.sizeC()).to.equal(1);
            expect(rect.$where).to.deep.equal(facet[r][c]);

            var point = rect.$matrix.getRC(0, 0)[0];
            expect(point.type).to.equal('ELEMENT.POINT');
            expect(point.x.scaleDim).to.equal('cycleTime');
            expect(point.y.scaleDim).to.equal('effort');
        });
    };

    it("should build logical graph (facet with 2 axes)", function () {

        var spec = {
            dimensions: {
                project: {scaleType: 'ordinal'},
                team: {scaleType: 'ordinal'},
                effort: {scaleType: 'linear'},
                cycleTime: {scaleType: 'linear'}
            },
            unit: {
                type: 'COORDS.RECT',
                x: 'project',
                y: 'team',
                unit: [
                    {
                        type: 'COORDS.RECT',
                        x: 'cycleTime',
                        y: 'effort',
                        unit: [
                            {
                                type: 'ELEMENT.POINT'
                            }
                        ]
                    }
                ]
            }
        };

        var originalSpecState = JSON.stringify(spec);

        var reader = new tauChart.__api__.DSLReader(spec, data);

        var logicalGraph = reader.buildGraph();

        var specStateAfterBuild = JSON.stringify(spec);

        expect(specStateAfterBuild).to.equal(originalSpecState);

        expect(logicalGraph.$matrix.sizeR()).to.equal(2);
        expect(logicalGraph.$matrix.sizeC()).to.equal(2);

        var facet = [
            [{ project: 'TP3', team: 'Alaska'    }, { project: 'TP2', team: 'Alaska'    }],
            [{ project: 'TP3', team: 'Exploited' }, { project: 'TP2', team: 'Exploited' }]
        ];

        checkFacetCells(logicalGraph.$matrix, facet);
    });

    it("should build logical graph (facet with 1 axis only)", function () {

        var reader = new tauChart.__api__.DSLReader(
            {
                dimensions: {
                    project: {scaleType: 'ordinal'},
                    team: {scaleType: 'ordinal'},
                    effort: {scaleType: 'linear'},
                    cycleTime: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    x: 'project',
                    y: null,
                    unit: [
                        {
                            type: 'COORDS.RECT',
                            x: 'cycleTime',
                            y: 'effort',
                            unit: [
                                {
                                    type: 'ELEMENT.POINT',
                                    x: 'cycleTime',
                                    y: 'effort'
                                }
                            ]
                        }
                    ]
                }
            },
            data);

        var logicalGraph = reader.buildGraph();

        expect(logicalGraph.$matrix.sizeR()).to.equal(1);
        expect(logicalGraph.$matrix.sizeC()).to.equal(2);

        var facet = [
            [{ project: 'TP3' }, { project: 'TP2' }]
        ];

        checkFacetCells(logicalGraph.$matrix, facet);
    });

    it("should build logical graph for empty facet (container 0 * 0 axes)", function () {

        var reader = new tauChart.__api__.DSLReader(
            {
                dimensions: {
                    project: {scaleType: 'ordinal'},
                    team: {scaleType: 'ordinal'},
                    effort: {scaleType: 'linear'},
                    cycleTime: {scaleType: 'linear'}
                },
                unit: {
                    type: 'COORDS.RECT',
                    x: null,
                    y: null,
                    unit: [
                        {
                            type: 'COORDS.RECT',
                            x: 'cycleTime',
                            y: 'effort',
                            unit: [
                                {
                                    type: 'ELEMENT.POINT'
                                }
                            ]
                        }
                    ]
                }
            },
            data);

        var logicalGraph = reader.buildGraph();

        expect(logicalGraph.$matrix.sizeR()).to.equal(1);
        expect(logicalGraph.$matrix.sizeC()).to.equal(1);

        var EMPTY_WHERE_EXPRESSION = {};
        var facet = [[EMPTY_WHERE_EXPRESSION]];

        checkFacetCells(logicalGraph.$matrix, facet);
    });
});