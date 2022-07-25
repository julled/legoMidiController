function LEGO() {}


var Shift = 0;
var Sync1 = 0;
var Sync2 = 0;
var Pitch1_last_before_sync=0;
var Pitch2_last_before_sync=0;
var Scroll_speed_slow = 0.02;
var Scroll_speed_fast = 0.01;
/* DEBUG POSSIBILITIES
script.midiDebug(1, 2, 3, 4, 4);
    print("asd");
*/

LEGO.init = function (id, debug) { 
/*
        var alpha = 1.0/8;
        var beta = alpha/32;
        engine.scratchEnable(1, 128, 33+1/3, alpha, beta);
        engine.scratchEnable(2, 128, 33+1/3, alpha, beta);
*/
	Shift = 0; 

}

LEGO.shutdown = function () {}


LEGO.incomingData = function(data, length) {
	if (data[0]==0xf0 && data[1]==0x00 && data[2]==0x00 && data[3]==0x7e && data[4]==0x4e) {
        var value = data[1];
	    var jogmove = (data[7]<<7) | data[6];
        var direction = data[5];
        var channel = data[8]
 
        var delta;
	    if(direction==1) delta = jogmove*Scroll_speed_slow;
	    if(direction==0) delta = -jogmove*Scroll_speed_slow;

        var group;
        if(channel == 31){
            group = "[Channel1]";        
        }
        else if(channel == 30){
            group = "[Channel2]";        
        }

	    if (Shift!=1)
	    {	
		    engine.setValue(group, "jog", delta);
	    }

	    else if (Shift==1 && jogmove>3)
	    {
		    // fast track search
		    var playposition = engine.getValue(group, "playposition");
		    if (undefined != playposition) 
		    {
		        var searchpos = playposition + Scroll_speed_fast * delta;
		        engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		    }
	    }
    }
}

LEGO.inboundSysex = function (data, length)
{
    if (data[0]==0xf0 && data[1]==0x00 && data[2]==0x00 && data[3]==0x7e && data[4]==0x4e) {
        var value = data[1];
	    var jogmove = (data[7]<<7) | data[6];
        var direction = data[5];
        var channel = data[8]
 
        var delta;
	    if(direction==1) delta = jogmove*Scroll_speed_slow;
	    if(direction==0) delta = -jogmove*Scroll_speed_slow;

        var group;
        if(channel == 31){
            group = "[Channel1]";        
        }
        else if(channel == 30){
            group = "[Channel2]";        
        }

	    if (Shift!=1)
	    {	
		    engine.setValue(group, "jog", delta);
	    }

	    else if (Shift==1 && jogmove>3)
	    {
		    // fast track search
		    var playposition = engine.getValue(group, "playposition");
		    if (undefined != playposition) 
		    {
		        var searchpos = playposition + Scroll_speed_fast * delta;
		        engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		    }
	    }
    }
};
/* jog via pitchbend
LEGO.Jogg = function (channel, control, value, status, group) 
{	

    var msg = (value << 7 ) | control;
	var jogmove = msg & 0x1fff;
    var direction = msg & 0x2000;
     print(msg);
    print(jogmove);
    print(direction);
    print(group);
    var delta;
	if(direction==0x2000) delta = jogmove*Scroll_speed_slow;
	if(direction==0x0000) delta = -jogmove*Scroll_speed_slow;
    print(delta);
	if (Shift!=1)
	{	
		engine.setValue(group, "jog", delta);
	}

	else if (Shift==1 && jogmove>3)
	{
		// fast track search
		var playposition = engine.getValue(group, "playposition");
		if (undefined != playposition) 
		{
		    var searchpos = playposition + Scroll_speed_fast * delta;
		    engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		}
	}
};*/

LEGO.Loop = function (channel, control, value, status, group) 
{
   
	if (value == 0x7F)
	{
		if (Shift == 0)
		{
			engine.setValue(group,"LoadSelectedTrack",1)
 		}
        else{
            engine.setValue(group,"beatloop_4_toggle",true);         
        }
 
	}		
};	

LEGO.Sync1 = function (channel, control, value, status, group) 
{
	if (value == 0x7F && Shift == 0)
	{
		if(Sync1==false)
		{
			engine.setValue("[Channel1]","sync_enabled",true); 			
	 		Sync1= 1;
		}
		else
		{
			engine.setValue("[Channel1]","sync_enabled",false); 			
	 		Sync1= 0;
		}
	}
	if (Shift==1)
	{
		engine.setValue("[Channel1]","loop_double",true); 	
	}
};

LEGO.Sync2 = function (channel, control, value, status, group) 
{
	if (value == 0x7F && Shift == 0)
	{
		if(Sync2==false)
		{
			engine.setValue("[Channel2]","sync_enabled",true); 			
	 		Sync2= 1;
		}
		else
		{
			engine.setValue("[Channel2]","sync_enabled",false); 			
	 		Sync2= 0;
		}
	} 
	if (Shift==1)
	{
		engine.setValue("[Channel2]","loop_double",true); 	
	}
};

LEGO.Vol1 = function (channel, control, value, status, group) 
{
	
	var midipitch14bit = ((value << 7 ) | control) - 8192;
	var vol = (-1.0/8192)*midipitch14bit;
	engine.setValue("[Channel1]","volume",vol);
};

LEGO.Rate1 = function (channel, control, value, status, group) 
{
	
	var midipitch14bit = ((value << 7 ) | control) - 8192;
	var midipitch = (-1.0/8192)*midipitch14bit;
	var delta_pitch = Math.abs(Pitch1_last_before_sync - midipitch);
	if ( delta_pitch > 500 )
	{
		Sync1 = 0
		engine.setValue("[Channel1]","sync_enabled",false);
	} 
	if(Sync1==0)
	{	 
		engine.setValue("[Channel1]","rate",midipitch);
		Pitch1_last_before_sync = midipitch
	}
};

LEGO.Rate2 = function (channel, control, value, status, group) 
{

	var midipitch14bit = ((value << 7 ) | control) - 8192;
	var midipitch = (-1.0/8192)*midipitch14bit;
	var delta_pitch = Math.abs(Pitch2_last_before_sync - midipitch);
	if ( delta_pitch > 500 )
	{
		Sync2 = 0
		engine.setValue("[Channel2]","sync_enabled",false);
	} 
	if(Sync2==0)
	{	 
		engine.setValue("[Channel2]","rate",midipitch);
		Pitch2_last_before_sync = midipitch
	}
};

LEGO.Shift = function (channel, control, value, status, group) 
{	
	if (value == 0x7F)
		Shift = 1;
	else
		Shift = 0;		
};
/*
LEGO.Jog = function (channel, control, value, status, group) 
{	
	var jogmove = 0 ;
	if(value==0x01) jogmove = -Jog_pitch_bend_speed;
	if(value==0x7F) jogmove = +Jog_pitch_bend_speed;

	if (!engine.getValue(group,"play") && Shift!=1)
	{	

		// slow track search
		//var playposition = engine.getValue(group, "playposition");
		//if (undefined != playposition) 
		//{
		//    var searchpos = playposition + Scroll_speed_slow * jogmove;
		//    engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		//}

		engine.setValue(group, "jog", jogmove*1.5);
	}
	else
	{
		engine.setValue(group, "jog", jogmove*1.5);
	}

	if (Shift==1)
	{
		// fast track search
		var playposition = engine.getValue(group, "playposition");
		if (undefined != playposition) 
		{
		    var searchpos = playposition + Scroll_speed_fast * jogmove;
		    engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		}
	}
}
*/

/*
LEGO.Jog = function (channel, control, value, status, group) 
{	
	var jogmove = value & 0x2f;
    var direction = value & 0x40;

    		print("Scrall_act");
    var delta;
	if(direction==0x40) delta = jogmove*Scroll_speed_slow;
	if(direction==0x00) delta = -jogmove*Scroll_speed_slow;

	if (Shift!=1)
	{	
		engine.setValue(group, "jog", delta);
	}

	else if (Shift==1 && jogmove>3)
	{
		// fast track search
		var playposition = engine.getValue(group, "playposition");
		if (undefined != playposition) 
		{
		    var searchpos = playposition + Scroll_speed_fast * delta;
		    engine.setValue(group, "playposition", Math.max(0.0, Math.min(1.0, searchpos)));
		}
	}
}
*/


LEGO.Scroll = function (channel, control, value, status, group) 
{	
	if (value == 0x7F)
		engine.setValue("[Library]", "MoveUp", true);
	else
		engine.setValue("[Library]", "MoveDown", true);
};



