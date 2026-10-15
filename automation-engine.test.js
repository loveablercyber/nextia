// @vitest-environment node
import { describe,expect,it,vi } from 'vitest';
import { AutomationEngine } from './automation-engine.js';

describe('AutomationEngine queue priority',()=>{
  it('processes queued events before schedule and campaign maintenance',async()=>{
    const order=[];
    const engine=new AutomationEngine({query:vi.fn(async()=>({rows:[]}))});
    engine.claimEvents=vi.fn(async()=>{order.push('claim');return[{id:'event-1'}]});
    engine.processEvent=vi.fn(async()=>{order.push('event');return'completed'});
    engine.enqueueDueSchedules=vi.fn(async()=>{order.push('schedules');return 0});

    const summary=await engine.processBatch(10);

    expect(order.slice(0,3)).toEqual(['claim','event','schedules']);
    expect(summary).toMatchObject({claimed:1,completed:1,retried:0,deadLettered:0});
  });
});
