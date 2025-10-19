# ECS

This was a first ECS attempt. I abandoned it as soon as I realised I could achieve a far greater performance by implementing bitmasks. The architecture I developed here would not fit well bitmasks so I opted to simply start again.

Plus, here I tried applied the dirty flag pattern, but I'm not happy with the outcome. At this point I'm not sure if it'd be better to have lifecycle hooks that allow consumders to trigger a cache update, instead of changing a flag and expecing the class to take care of everything.

I'm also not happy with the number of loops the System class needs to go through for each frame.
