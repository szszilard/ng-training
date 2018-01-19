import { Component, OnInit } from '@angular/core';

import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from "rxjs/observable/combineLatest";
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public tasks: Task[];
  public loading: boolean;

  public constructor(private _taskService: TaskService) {
    //
  }

  public ngOnInit() {
    this.loadTasks();
  }

  public loadTasks() {
    this.loading = true;
    this._taskService.list().subscribe(
      tasks => {
        this.tasks = tasks.sort((t1, t2) => t1.position - t2.position);
        this.loading = false;
      }
    );
  }

  public addNewTask() {
    this.loading = true;
    const task = new Task();
    task.name = 'New Task';
    task.position = this.tasks.length;
    this._taskService.create(task).subscribe(
      () => this.loadTasks(),
      () => this.loadTasks()
    );
  }

  public removeTask(task: Task) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) {
      this.tasks.splice(index, 1);
    }

    let list: Array<Observable<any>> = [];
    for (var i = index; i < this.tasks.length; i++) {
      this.tasks[i].position--;
      list.push(this._taskService.update(this.tasks[i]));
    }

    combineLatest(list).subscribe(results => {
      this.loadTasks();
    });


  }

  public removeAllTasks() {
    for (let t of this.tasks) {
      this._taskService.delete(t).subscribe(
        () => {
          this.removeTask(t);
          if (this.tasks.length == 0) {
            this.loadTasks();
          }
        },
        () => this.loadTasks()
      );
    }

  }

  public sortUp(task: Task) {
    if (task.position > 0) {
      task.position--;
      this.tasks[task.position].position++;

      let updateCurrentTask = this._taskService.update(task);
      let updatePreviousTask = this._taskService.update(this.tasks[task.position]);
      combineLatest([updateCurrentTask, updatePreviousTask]).subscribe(results => { this.loadTasks(); });

    }


  }

  public sortDown(task: Task) {
    if (task.position < this.tasks.length - 1) {
      task.position++;
      this.tasks[task.position].position--;

      let updateCurrentTask = this._taskService.update(task);
      let updateNextTask = this._taskService.update(this.tasks[task.position]);

      combineLatest([updateCurrentTask, updateNextTask]).subscribe(results => { this.loadTasks(); });
    }


  }

}
