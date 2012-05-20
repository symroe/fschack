#riverMaths.py
import math

def calCSA(width, avgDepth):
    return width * avgDepth
    
def calHR(CSA,wetPerim):
    return CSA / wetPerim
    
def calDischarge(CSA,HR):
    return CSA * HR
    
def calAvgFlowVelocity(avgFlowTime):
    return (3.2805/avgFlowTime)+0.0277

def calMannings(hr,gradient):
    #return (hr**(2/3))*(math.tan(math.radians(gradient**(1/2)))
    return (hr**(2/3))* math.tan(math.radians(val**(1/2)))