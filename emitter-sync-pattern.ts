/* Check the comments first */

import { EventEmitter } from "./emitter";
import { EventDelayedRepository } from "./event-repository";
import { EventStatistics } from "./event-statistics";
import { ResultsTester } from "./results-tester";
import { triggerRandomly } from "./utils";

const MAX_EVENTS = 1000;

enum EventName {
  EventA = "A",
  EventB = "B",
}

const EVENT_NAMES = [EventName.EventA, EventName.EventB];

/*

  An initial configuration for this case

*/

function init() {
  const emitter = new EventEmitter<EventName>();

  triggerRandomly(() => emitter.emit(EventName.EventA), MAX_EVENTS);
  triggerRandomly(() => emitter.emit(EventName.EventB), MAX_EVENTS);

  const repository = new EventRepository();
  const handler = new EventHandler(emitter, repository);

  const resultsTester = new ResultsTester({
    eventNames: EVENT_NAMES,
    emitter,
    handler,
    repository,
  });
  resultsTester.showStats(20);
}

/* Please do not change the code above this line */
/* ----–––––––––––––––––––––––––––––––––––––---- */

/*

  The implementation of EventHandler and EventRepository is up to you.
  Main idea is to subscribe to EventEmitter, save it in local stats
  along with syncing with EventRepository.

  The implementation of EventHandler and EventRepository is flexible and left to your discretion.
  The primary objective is to subscribe to EventEmitter, record the events in `.eventStats`,
  and ensure synchronization with EventRepository.

  The ultimate aim is to have the `.eventStats` of EventHandler and EventRepository
  have the same values (and equal to the actual events fired by the emitter) by the
  time MAX_EVENTS have been fired.

*/
class EventHandler extends EventStatistics<EventName> {
  repository: EventRepository;

  constructor(emitter: EventEmitter<EventName>, repository: EventRepository) {
    super();
    this.repository = repository;

    // Подписка на события и обновление локальных статистик
    emitter.subscribe(EventName.EventA, () => {
      const currentCount = this.getStats(EventName.EventA) + 1; // Получаем текущее количество
      this.setStats(EventName.EventA, currentCount); // Обновление локальной статистики
      this.repository.saveEventData(EventName.EventA, currentCount); // Синхронизация с репозиторием
    });

    emitter.subscribe(EventName.EventB, () => {
      const currentCount = this.getStats(EventName.EventB) + 1; // Получаем текущее количество
      this.setStats(EventName.EventB, currentCount); // Обновление локальной статистики
      this.repository.saveEventData(EventName.EventB, currentCount); // Синхронизация с репозиторием
    });
  }
}

class EventRepository extends EventDelayedRepository<EventName> {
  async saveEventData(eventName: EventName, count: number) {
    try {
      await this.updateEventStatsBy(eventName, count); // Обновление статистики в репозитории
    } catch (e) {
      // Обработка ошибок
      // const _error = e as EventRepositoryError;
      // console.warn(error);
    }
  }

  async updateEventStatsBy(eventName: EventName, by: number) {
    // Обновляем статистику в репозитории
    const currentCount = this.getStats(eventName) + by;
    this.setStats(eventName, currentCount);
    await super.updateEventStatsBy(eventName, by); // Вызов родительского метода
  }
}

init();
