"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicalExpr = exports.AssignExpr = exports.VariableExpr = exports.LiteralExpr = exports.GroupingExpr = exports.BinaryExpr = exports.UnaryExpr = exports.Expr = void 0;
var Expr = /** @class */ (function () {
    function Expr() {
    }
    return Expr;
}());
exports.Expr = Expr;
var UnaryExpr = /** @class */ (function (_super) {
    __extends(UnaryExpr, _super);
    function UnaryExpr(operator, right) {
        var _this = _super.call(this) || this;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    UnaryExpr.prototype.accept = function (visitor) {
        return visitor.visitUnaryExpr(this);
    };
    return UnaryExpr;
}(Expr));
exports.UnaryExpr = UnaryExpr;
var BinaryExpr = /** @class */ (function (_super) {
    __extends(BinaryExpr, _super);
    function BinaryExpr(left, operator, right) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    BinaryExpr.prototype.accept = function (visitor) {
        return visitor.visitBinaryExpr(this);
    };
    return BinaryExpr;
}(Expr));
exports.BinaryExpr = BinaryExpr;
var GroupingExpr = /** @class */ (function (_super) {
    __extends(GroupingExpr, _super);
    function GroupingExpr(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    GroupingExpr.prototype.accept = function (visitor) {
        return visitor.visitGroupingExpr(this);
    };
    return GroupingExpr;
}(Expr));
exports.GroupingExpr = GroupingExpr;
var LiteralExpr = /** @class */ (function (_super) {
    __extends(LiteralExpr, _super);
    function LiteralExpr(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    LiteralExpr.prototype.accept = function (visitor) {
        return visitor.visitLiteralExpr(this);
    };
    return LiteralExpr;
}(Expr));
exports.LiteralExpr = LiteralExpr;
var VariableExpr = /** @class */ (function (_super) {
    __extends(VariableExpr, _super);
    function VariableExpr(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        return _this;
    }
    VariableExpr.prototype.accept = function (visitor) {
        return visitor.visitVariableExpr(this);
    };
    return VariableExpr;
}(Expr));
exports.VariableExpr = VariableExpr;
var AssignExpr = /** @class */ (function (_super) {
    __extends(AssignExpr, _super);
    function AssignExpr(name, value) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    AssignExpr.prototype.accept = function (visitor) {
        return visitor.visitAssignExpr(this);
    };
    return AssignExpr;
}(Expr));
exports.AssignExpr = AssignExpr;
var LogicalExpr = /** @class */ (function (_super) {
    __extends(LogicalExpr, _super);
    function LogicalExpr(left, operator, right) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    LogicalExpr.prototype.accept = function (visitor) {
        return visitor.visitLogicalExpr(this);
    };
    return LogicalExpr;
}(Expr));
exports.LogicalExpr = LogicalExpr;