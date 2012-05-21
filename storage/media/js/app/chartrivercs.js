function createCrossSection(chartDiv,wetWidth,depthMeasurements) {				
	var chartTitle = "River cross-section";
	var points = [];
	var wetWidthPoints = [];
	var depthPoints = [];
	var numDepthPoints = depthMeasurements.length;
	var sectionWidth = wetWidth / numDepthPoints;
	var cumDepth = 0;
	var avgDepth = 0;
	var seriesDescriptions = [];
					
	for(i=0;i < numDepthPoints; i++) {
		wetWidthPoints.push([sectionWidth*i,0]);
		depthPoints.push([sectionWidth*i,0-depthMeasurements[i]]);
		cumDepth += depthMeasurements[i];					
	}
	avgDepth = Math.round((cumDepth / numDepthPoints)*100)/100;
	points.push(wetWidthPoints)
	points.push(depthPoints);
	
	seriesDescriptions.push("Wet Width = "+wetWidth+"m");
	seriesDescriptions.push("Average Depth = "+avgDepth+"mm");
	
	plotCrossSectionGraph(chartDiv,points,seriesDescriptions,chartTitle);
}

function plotCrossSectionGraph(chartDiv,points,seriesDescriptions,chartTitle) {
	$.jqplot(chartDiv,points,{
							title: chartTitle,
							seriesColors: ["#33CCFF","#996633"],
							seriesDefaults: {
								fill: true
							},
							series: [											
								{ label:seriesDescriptions[0] },
								{ 
									label:seriesDescriptions[1], 
									rendererOptions: { smooth: true } 
								}
							],
							legend: {
								show:true,
								location: 'ne'
							}										
						   });
}