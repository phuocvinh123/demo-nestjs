import { Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, ValidationPipe } from "@nestjs/common";
import { CreateEventDto } from './create-event.dto';
import { Event } from './event.entity';
import { UpdateEventDto } from "./update-event.dto";
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";


@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  constructor(
    @InjectRepository(Event)
    private readonly repository:Repository<Event>
  ){}

  @Get()
  async findAll() {
    this.logger.log(`Hit the findAll router`);
    const events= await this.repository.find();
    this.logger.debug(`Found ${events.length} events)`);
    return events;
  }

  @Get("/practice")
  async practice(){
    return await this.repository.find({
      select:['id','when'],
      where:[{ id:MoreThan(3),
        when:MoreThan(new Date ('2021-02-12T13:00:00'))
      },{description:Like('%meet%')}],
      take:2,
      order:{
        id:'DESC'
      }
    });
  }

  @Get(':id')
 async findOne(@Param('id',ParseIntPipe) id) {
  // console.log(typeof id);
  const event=await this.repository.findOne(id);
    if(!event){
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
 async create(@Body() input: CreateEventDto) {
   return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  @Patch(':id')
 async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id);
    if(!event){
      throw new NotFoundException();
    }
return await this.repository.save({
      ...event,
      ...input,
      when: input.when ?
        new Date(input.when) :event.when
    })

    
  }

  @Delete(':id')
  @HttpCode(204)
 async remove(@Param('id') id) {
  const event=await this.repository.findOne(id);
  if(!event){
    throw new NotFoundException();
  }
  return this.repository.remove(event);
  }
}